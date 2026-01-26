import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Interface for optimized image data from API
 */
export interface OptimizedImageData {
  id: number;
  alt_text: string;
  width: number;
  height: number;
  src: string;
  webp_src?: string;
  srcset?: string;
  srcset_webp?: string;
  sizes?: string;
  placeholder?: string;
  dominant_color?: string;
  blurhash?: string;
}

/**
 * Interface for picture element data from API
 */
export interface PictureElementData {
  sources: Array<{
    srcset: string;
    type: string;
    sizes: string;
  }>;
  img: {
    src: string;
    alt: string;
    width: number;
    height: number;
    loading: string;
    decoding: string;
    style?: string;
    'data-placeholder'?: string;
    'data-blurhash'?: string;
  };
}

/**
 * OptimizedImageComponent
 *
 * A lazy-loading image component with WebP support and blur-up effect.
 *
 * Features:
 * - Lazy loading with Intersection Observer
 * - WebP format with fallback
 * - Responsive images (srcset/sizes)
 * - Blur-up placeholder effect
 * - Dominant color background
 * - BlurHash support (optional)
 *
 * Usage:
 * ```html
 * <app-optimized-image
 *   [imageData]="media"
 *   [priority]="false"
 *   [objectFit]="'cover'"
 *   (loaded)="onImageLoaded()"
 * ></app-optimized-image>
 * ```
 */
@Component({
  selector: 'app-optimized-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="optimized-image-container"
      [style.backgroundColor]="backgroundColor"
      [style.aspectRatio]="aspectRatio"
      [class.loaded]="isLoaded"
    >
      <!-- Placeholder (blur-up effect) -->
      @if (showPlaceholder && placeholderSrc) {
        <img
          class="placeholder"
          [src]="placeholderSrc"
          [alt]="''"
          aria-hidden="true"
        />
      }

      <!-- Main image with picture element for WebP support -->
      <picture #pictureElement>
        <!-- WebP source -->
        @if (webpSrcset) {
          <source
            [srcset]="webpSrcset"
            [sizes]="sizes"
            type="image/webp"
          />
        }

        <!-- Fallback source -->
        @if (srcset) {
          <source
            [srcset]="srcset"
            [sizes]="sizes"
            [type]="mimeType"
          />
        }

        <!-- Fallback img -->
        <img
          #imgElement
          [src]="currentSrc"
          [alt]="alt"
          [width]="width"
          [height]="height"
          [loading]="priority ? 'eager' : 'lazy'"
          [decoding]="priority ? 'sync' : 'async'"
          [style.objectFit]="objectFit"
          (load)="onLoad()"
          (error)="onError()"
          class="main-image"
          [class.visible]="isLoaded"
        />
      </picture>

      <!-- Loading spinner -->
      @if (showSpinner && !isLoaded && !hasError) {
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
      }

      <!-- Error state -->
      @if (hasError) {
        <div class="error-state">
          <span class="error-icon">!</span>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .optimized-image-container {
      position: relative;
      overflow: hidden;
      width: 100%;
      background-size: cover;
      background-position: center;
    }

    .placeholder {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: blur(20px);
      transform: scale(1.1);
      transition: opacity 0.3s ease-out;
    }

    .optimized-image-container.loaded .placeholder {
      opacity: 0;
    }

    .main-image {
      display: block;
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 0.3s ease-in;
    }

    .main-image.visible {
      opacity: 1;
    }

    .loading-spinner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .error-state {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.5);
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
    }

    .error-icon {
      font-size: 24px;
      font-weight: bold;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptimizedImageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('imgElement') imgElement!: ElementRef<HTMLImageElement>;
  @ViewChild('pictureElement') pictureElement!: ElementRef<HTMLPictureElement>;

  /** Image data from API */
  @Input() imageData?: OptimizedImageData;

  /** Picture element data from API (alternative to imageData) */
  @Input() pictureData?: PictureElementData;

  /** Direct image URL (fallback if no imageData) */
  @Input() src?: string;

  /** WebP image URL */
  @Input() webpSrc?: string;

  /** Srcset for responsive images */
  @Input() srcset?: string;

  /** WebP srcset */
  @Input() webpSrcset?: string;

  /** Sizes attribute */
  @Input() sizes: string = '100vw';

  /** Alt text */
  @Input() alt: string = '';

  /** Image width */
  @Input() width?: number;

  /** Image height */
  @Input() height?: number;

  /** Base64 placeholder for blur-up effect */
  @Input() placeholder?: string;

  /** Dominant color for background */
  @Input() dominantColor?: string;

  /** BlurHash string */
  @Input() blurhash?: string;

  /** Priority loading (above the fold) */
  @Input() priority: boolean = false;

  /** Object fit style */
  @Input() objectFit: 'cover' | 'contain' | 'fill' | 'none' = 'cover';

  /** Show loading spinner */
  @Input() showSpinner: boolean = false;

  /** MIME type for fallback source */
  @Input() mimeType: string = 'image/jpeg';

  /** Threshold for intersection observer (0-1) */
  @Input() threshold: number = 0.1;

  /** Root margin for intersection observer */
  @Input() rootMargin: string = '50px';

  isLoaded = false;
  hasError = false;
  showPlaceholder = true;
  currentSrc: string = '';
  placeholderSrc: string = '';
  backgroundColor: string = '#f0f0f0';
  aspectRatio: string = 'auto';

  private observer?: IntersectionObserver;
  private isIntersecting = false;

  constructor(
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.processInputs();
  }

  ngAfterViewInit(): void {
    if (!this.priority) {
      this.setupIntersectionObserver();
    } else {
      this.loadImage();
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private processInputs(): void {
    // Process imageData if provided
    if (this.imageData) {
      this.src = this.imageData.src;
      this.webpSrc = this.imageData.webp_src;
      this.srcset = this.imageData.srcset;
      this.webpSrcset = this.imageData.srcset_webp;
      this.sizes = this.imageData.sizes || this.sizes;
      this.alt = this.imageData.alt_text || this.alt;
      this.width = this.imageData.width;
      this.height = this.imageData.height;
      this.placeholder = this.imageData.placeholder;
      this.dominantColor = this.imageData.dominant_color;
      this.blurhash = this.imageData.blurhash;
    }

    // Process pictureData if provided
    if (this.pictureData) {
      const { img, sources } = this.pictureData;
      this.src = img.src;
      this.alt = img.alt;
      this.width = img.width;
      this.height = img.height;

      const webpSource = sources.find(s => s.type === 'image/webp');
      const fallbackSource = sources.find(s => s.type !== 'image/webp');

      if (webpSource) {
        this.webpSrcset = webpSource.srcset;
        this.sizes = webpSource.sizes;
      }
      if (fallbackSource) {
        this.srcset = fallbackSource.srcset;
        this.mimeType = fallbackSource.type;
      }
    }

    // Set placeholder
    this.placeholderSrc = this.placeholder || '';

    // Set background color
    if (this.dominantColor) {
      this.backgroundColor = this.dominantColor;
    }

    // Set aspect ratio
    if (this.width && this.height) {
      this.aspectRatio = `${this.width} / ${this.height}`;
    }

    // Initial src (use placeholder or transparent pixel until loaded)
    this.currentSrc = this.priority ? (this.webpSrc || this.src || '') : '';
  }

  private setupIntersectionObserver(): void {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !this.isIntersecting) {
              this.isIntersecting = true;
              this.loadImage();
              this.observer?.disconnect();
            }
          });
        },
        {
          threshold: this.threshold,
          rootMargin: this.rootMargin
        }
      );

      this.observer.observe(this.elementRef.nativeElement);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage();
    }
  }

  private loadImage(): void {
    this.currentSrc = this.webpSrc || this.src || '';
    this.cdr.markForCheck();
  }

  onLoad(): void {
    this.isLoaded = true;
    this.hasError = false;

    // Hide placeholder after transition
    setTimeout(() => {
      this.showPlaceholder = false;
      this.cdr.markForCheck();
    }, 300);

    this.cdr.markForCheck();
  }

  onError(): void {
    this.hasError = true;
    this.isLoaded = false;

    // Try fallback to non-WebP
    if (this.currentSrc === this.webpSrc && this.src) {
      this.currentSrc = this.src;
      this.hasError = false;
    }

    this.cdr.markForCheck();
  }

  /**
   * Get aspect ratio for container sizing
   */
  get computedAspectRatio(): string {
    if (this.width && this.height) {
      return `${this.width} / ${this.height}`;
    }
    return 'auto';
  }
}
