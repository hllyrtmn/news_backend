"""
Celery tasks for media processing.

Handles async image optimization, WebP conversion, and responsive image generation.
"""
from celery import shared_task
from celery.exceptions import MaxRetriesExceededError
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    autoretry_for=(Exception,),
    retry_backoff=True,
    queue='default'
)
def process_image_task(self, media_id):
    """
    Async task to process and optimize an uploaded image.

    Generates:
    - WebP version
    - Responsive variants (xs, sm, md, lg, xl, 2xl)
    - WebP responsive variants
    - Thumbnail and WebP thumbnail
    - Base64 placeholder for lazy loading
    - Dominant color
    - BlurHash (if available)

    Args:
        media_id: ID of the Media instance to process
    """
    from apps.media_app.models import Media
    from utils.image_optimizer import process_media_image, generate_blurhash

    try:
        media = Media.objects.get(id=media_id)

        if media.file_type != 'image':
            logger.info(f"Media {media_id} is not an image, skipping processing")
            return {'status': 'skipped', 'reason': 'not_image'}

        if media.processing_status == 'completed':
            logger.info(f"Media {media_id} already processed, skipping")
            return {'status': 'skipped', 'reason': 'already_processed'}

        # Mark as processing
        media.processing_status = 'processing'
        media.save(update_fields=['processing_status'])

        logger.info(f"Starting image processing for Media {media_id}")

        # Process the image
        success = process_media_image(media)

        if success:
            # Generate blurhash (optional)
            try:
                media.refresh_from_db()
                blurhash = generate_blurhash(media.file)
                if blurhash:
                    media.blurhash = blurhash
                    media.save(update_fields=['blurhash'])
            except Exception as e:
                logger.warning(f"BlurHash generation failed for Media {media_id}: {str(e)}")

            # Invalidate any cached media data
            cache.delete(f'media_detail_{media_id}')

            logger.info(f"Successfully completed image processing for Media {media_id}")
            return {'status': 'success', 'media_id': media_id}
        else:
            return {'status': 'failed', 'media_id': media_id}

    except Media.DoesNotExist:
        logger.error(f"Media {media_id} not found")
        return {'status': 'error', 'reason': 'not_found'}

    except Exception as e:
        logger.error(f"Error processing Media {media_id}: {str(e)}")
        try:
            # Update status to failed
            Media.objects.filter(id=media_id).update(processing_status='failed')
        except Exception:
            pass
        raise self.retry(exc=e)


@shared_task(
    bind=True,
    max_retries=2,
    queue='low_priority'
)
def batch_process_images_task(self, media_ids):
    """
    Batch process multiple images.

    Args:
        media_ids: List of Media IDs to process

    Returns:
        dict with processing results
    """
    results = {
        'total': len(media_ids),
        'success': 0,
        'failed': 0,
        'skipped': 0
    }

    for media_id in media_ids:
        try:
            result = process_image_task.delay(media_id)
            results['success'] += 1
        except Exception as e:
            logger.error(f"Failed to queue Media {media_id}: {str(e)}")
            results['failed'] += 1

    return results


@shared_task(queue='low_priority')
def reprocess_unoptimized_images():
    """
    Find and reprocess any images that failed or weren't processed.

    Should be scheduled to run periodically to catch any missed images.
    """
    from apps.media_app.models import Media

    unprocessed = Media.objects.filter(
        file_type='image',
        processing_status__in=['pending', 'failed']
    ).values_list('id', flat=True)[:100]  # Process max 100 at a time

    if unprocessed:
        logger.info(f"Found {len(unprocessed)} unprocessed images, queuing for processing")
        batch_process_images_task.delay(list(unprocessed))

    return {'queued': len(unprocessed)}


@shared_task(queue='low_priority')
def cleanup_orphaned_image_variants():
    """
    Clean up orphaned image variant files that are no longer referenced.

    Runs periodically to free up storage.
    """
    import os
    from django.conf import settings
    from apps.media_app.models import Media

    cleaned = 0
    errors = 0

    # Get all variant paths from database
    variant_fields = [
        'webp_file', 'webp_thumbnail',
        'image_xs', 'image_sm', 'image_md', 'image_lg', 'image_xl', 'image_2xl',
        'webp_xs', 'webp_sm', 'webp_md', 'webp_lg', 'webp_xl', 'webp_2xl'
    ]

    db_paths = set()
    for field in variant_fields:
        paths = Media.objects.exclude(**{field: ''}).values_list(field, flat=True)
        db_paths.update(paths)

    # Check responsive directories for orphaned files
    responsive_dirs = [
        'media/responsive/xs',
        'media/responsive/sm',
        'media/responsive/md',
        'media/responsive/lg',
        'media/responsive/xl',
        'media/responsive/2xl',
        'media/responsive/webp/xs',
        'media/responsive/webp/sm',
        'media/responsive/webp/md',
        'media/responsive/webp/lg',
        'media/responsive/webp/xl',
        'media/responsive/webp/2xl',
        'media/webp',
        'thumbnails/webp',
    ]

    for dir_path in responsive_dirs:
        full_dir = os.path.join(settings.MEDIA_ROOT, dir_path)
        if not os.path.exists(full_dir):
            continue

        for root, dirs, files in os.walk(full_dir):
            for filename in files:
                file_path = os.path.join(root, filename)
                relative_path = os.path.relpath(file_path, settings.MEDIA_ROOT)

                if relative_path not in db_paths:
                    try:
                        os.remove(file_path)
                        cleaned += 1
                        logger.debug(f"Removed orphaned file: {relative_path}")
                    except Exception as e:
                        errors += 1
                        logger.error(f"Failed to remove orphaned file {relative_path}: {str(e)}")

    logger.info(f"Cleanup complete: {cleaned} files removed, {errors} errors")
    return {'cleaned': cleaned, 'errors': errors}


@shared_task(
    bind=True,
    queue='default'
)
def regenerate_image_variants_task(self, media_id, variants=None):
    """
    Regenerate specific image variants for a Media instance.

    Useful when variant settings change or files get corrupted.

    Args:
        media_id: ID of the Media instance
        variants: List of variant names to regenerate (None = all)
    """
    from apps.media_app.models import Media
    from utils.image_optimizer import ImageOptimizer, RESPONSIVE_SIZES
    import os

    try:
        media = Media.objects.get(id=media_id)

        if media.file_type != 'image':
            return {'status': 'skipped', 'reason': 'not_image'}

        optimizer = ImageOptimizer(media.file)
        original_name = os.path.splitext(os.path.basename(media.file.name))[0]

        if variants is None:
            variants = ['webp', 'thumbnail', 'webp_thumbnail', 'responsive', 'webp_responsive']

        regenerated = []

        if 'webp' in variants:
            webp_content = optimizer.convert_to_webp()
            media.webp_file.save(f'{original_name}.webp', webp_content, save=False)
            regenerated.append('webp')

        if 'thumbnail' in variants:
            thumb_content = optimizer.generate_thumbnail()
            media.thumbnail.save(f'{original_name}_thumb.jpg', thumb_content, save=False)
            regenerated.append('thumbnail')

        if 'webp_thumbnail' in variants:
            webp_thumb = optimizer.generate_webp_thumbnail()
            media.webp_thumbnail.save(f'{original_name}_thumb.webp', webp_thumb, save=False)
            regenerated.append('webp_thumbnail')

        if 'responsive' in variants:
            for name, width in RESPONSIVE_SIZES.items():
                variant_content = optimizer.generate_responsive_variant(width, format='original')
                if variant_content:
                    field = getattr(media, f'image_{name}')
                    field.save(f'{original_name}_image_{name}.jpg', variant_content, save=False)
                    regenerated.append(f'image_{name}')

        if 'webp_responsive' in variants:
            for name, width in RESPONSIVE_SIZES.items():
                variant_content = optimizer.generate_responsive_variant(width, format='webp')
                if variant_content:
                    field = getattr(media, f'webp_{name}')
                    field.save(f'{original_name}_webp_{name}.webp', variant_content, save=False)
                    regenerated.append(f'webp_{name}')

        media.save()

        # Invalidate cache
        cache.delete(f'media_detail_{media_id}')

        logger.info(f"Regenerated variants for Media {media_id}: {regenerated}")
        return {'status': 'success', 'regenerated': regenerated}

    except Media.DoesNotExist:
        return {'status': 'error', 'reason': 'not_found'}
    except Exception as e:
        logger.error(f"Error regenerating variants for Media {media_id}: {str(e)}")
        raise
