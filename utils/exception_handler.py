from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Özel exception handler - Tüm hataları loglar ve standart format döner
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
