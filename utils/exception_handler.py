from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import Throttled
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Özel exception handler - Tüm hataları loglar ve standart format döner
    Rate limiting için özel mesajlar içerir
    """
    # DRF'nin varsayılan exception handler'ını çağır
    response = drf_exception_handler(exc, context)
    
    # Eğer DRF exception değilse
    if response is None:
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        
        return Response(
            {
                'error': 'Internal server error',
                'detail': str(exc) if logger.isEnabledFor(logging.DEBUG) else 'An error occurred'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Rate limiting için özel mesaj
    if isinstance(exc, Throttled):
        wait_time = exc.wait
        custom_response_data = {
            'error': True,
            'status_code': status.HTTP_429_TOO_MANY_REQUESTS,
            'message': 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.',
            'detail': f'İstek limitini aştınız. {int(wait_time)} saniye sonra tekrar deneyin.',
            'retry_after': int(wait_time) if wait_time else None,
        }
        response.data = custom_response_data
        response.status_code = status.HTTP_429_TOO_MANY_REQUESTS

        # Retry-After header ekle (RFC 6585)
        if wait_time:
            response['Retry-After'] = str(int(wait_time))

        logger.warning(
            f"Rate limit exceeded for {context.get('request').user if context.get('request') else 'Anonymous'}",
            extra={'wait_time': wait_time}
        )

        return response

    # Standart hata formatı
    custom_response_data = {
        'error': True,
        'status_code': response.status_code,
    }

    # Hata mesajını ekle
    if isinstance(response.data, dict):
        if 'detail' in response.data:
            custom_response_data['message'] = response.data['detail']
        else:
            custom_response_data['errors'] = response.data
    else:
        custom_response_data['message'] = str(response.data)
    
    # Hatayı logla
    logger.warning(
        f"API Error: {exc.__class__.__name__} - {custom_response_data.get('message', 'No message')}",
        extra={'status_code': response.status_code}
    )
    
    response.data = custom_response_data
    
    return response
