import re
from django.utils.text import slugify
from bs4 import BeautifulSoup


def generate_unique_slug(model_class, title, instance=None):
    """
    Model için benzersiz slug oluşturur
    
    Args:
        model_class: Django model sınıfı
        title: Slug oluşturulacak başlık
        instance: Güncelleme işleminde mevcut instance (opsiyonel)
    
    Returns:
        str: Benzersiz slug
    """
    base_slug = slugify(title, allow_unicode=True)
    slug = base_slug
    counter = 1
    
    while True:
        # Mevcut instance'ı hariç tut
        queryset = model_class.objects.filter(slug=slug)
        if instance:
            queryset = queryset.exclude(pk=instance.pk)
        
        if not queryset.exists():
            return slug
        
        # Sayaç ekleyerek yeni slug oluştur
        slug = f"{base_slug}-{counter}"
        counter += 1


def calculate_read_time(content):
    """
    İçeriğin okuma süresini hesaplar
    
    Args:
        content: HTML içerik
    
    Returns:
        int: Tahmini okuma süresi (dakika)
    """
    # HTML etiketlerini temizle
    soup = BeautifulSoup(content, 'html.parser')
    text = soup.get_text()
    
    # Kelimeleri say
    words = len(text.split())
    
    # Ortalama okuma hızı: 200 kelime/dakika
    read_time = max(1, words // 200)
    
    return read_time


def clean_html(html_content):
    """
    HTML içeriğini temizler ve güvenli hale getirir
    
    Args:
        html_content: Temizlenecek HTML içerik
    
    Returns:
        str: Temizlenmiş HTML
    """
    import bleach
    
    # İzin verilen HTML etiketleri
    ALLOWED_TAGS = [
        'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'blockquote', 'code', 'pre', 'ul', 'ol', 'li', 'a', 'img', 'iframe',
        'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span'
    ]
    
    # İzin verilen HTML özellikleri
    ALLOWED_ATTRIBUTES = {
        '*': ['class', 'id'],
        'a': ['href', 'title', 'target', 'rel'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        'iframe': ['src', 'width', 'height', 'frameborder', 'allowfullscreen'],
        'table': ['border', 'cellpadding', 'cellspacing'],
    }
    
    return bleach.clean(
        html_content,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        strip=True
    )


def truncate_words(text, word_count=50, suffix='...'):
    """
    Metni belirtilen kelime sayısına göre kısaltır
    
    Args:
        text: Kısaltılacak metin
        word_count: Maksimum kelime sayısı
        suffix: Sonuna eklenecek metin
    
    Returns:
        str: Kısaltılmış metin
    """
    words = text.split()
    if len(words) <= word_count:
        return text
    
    truncated = ' '.join(words[:word_count])
    return truncated + suffix


def extract_video_id(url, platform='youtube'):
    """
    Video URL'sinden video ID'sini çıkarır
    
    Args:
        url: Video URL'si
        platform: Platform adı ('youtube', 'vimeo', 'dailymotion')
    
    Returns:
        str: Video ID veya None
    """
    if platform == 'youtube':
        # YouTube video ID çıkar
        patterns = [
            r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
            r'(?:embed\/)([0-9A-Za-z_-]{11})',
            r'(?:watch\?v=)([0-9A-Za-z_-]{11})'
        ]
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
    
    elif platform == 'vimeo':
        # Vimeo video ID çıkar
        match = re.search(r'vimeo\.com\/(\d+)', url)
        if match:
            return match.group(1)
    
    elif platform == 'dailymotion':
        # Dailymotion video ID çıkar
        match = re.search(r'dailymotion\.com\/video\/([^_]+)', url)
        if match:
            return match.group(1)
    
    return None


def generate_video_embed(url, width=640, height=360):
    """
    Video URL'sinden embed kodu oluşturur
    
    Args:
        url: Video URL'si
        width: Video genişliği
        height: Video yüksekliği
    
    Returns:
        str: Embed HTML kodu veya None
    """
    # YouTube
    if 'youtube.com' in url or 'youtu.be' in url:
        video_id = extract_video_id(url, 'youtube')
        if video_id:
            return f'''<iframe width="{width}" height="{height}" 
                src="https://www.youtube.com/embed/{video_id}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen></iframe>'''
    
    # Vimeo
    elif 'vimeo.com' in url:
        video_id = extract_video_id(url, 'vimeo')
        if video_id:
            return f'''<iframe src="https://player.vimeo.com/video/{video_id}" 
                width="{width}" height="{height}" 
                frameborder="0" 
                allow="autoplay; fullscreen; picture-in-picture" 
                allowfullscreen></iframe>'''
    
    # Dailymotion
    elif 'dailymotion.com' in url:
        video_id = extract_video_id(url, 'dailymotion')
        if video_id:
            return f'''<iframe frameborder="0" width="{width}" height="{height}" 
                src="https://www.dailymotion.com/embed/video/{video_id}" 
                allowfullscreen allow="autoplay"></iframe>'''
    
    return None


def format_number(number, decimal_places=0):
    """
    Sayıyı formatlar (1000 -> 1K, 1000000 -> 1M)
    
    Args:
        number: Formatlanacak sayı
        decimal_places: Ondalık basamak sayısı
    
    Returns:
        str: Formatlanmış sayı
    """
    if number >= 1000000:
        return f"{number/1000000:.{decimal_places}f}M"
    elif number >= 1000:
        return f"{number/1000:.{decimal_places}f}K"
    else:
        return str(number)


def get_client_ip(request):
    """
    İstek yapan client'ın IP adresini alır
    
    Args:
        request: Django request objesi
    
    Returns:
        str: IP adresi
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def parse_user_agent(user_agent_string):
    """
    User agent string'ini parse eder
    
    Args:
        user_agent_string: User agent string
    
    Returns:
        dict: Device, OS ve browser bilgileri
    """
    from user_agents import parse
    
    ua = parse(user_agent_string)
    
    return {
        'device_type': 'mobile' if ua.is_mobile else ('tablet' if ua.is_tablet else 'desktop'),
        'browser': f"{ua.browser.family} {ua.browser.version_string}",
        'os': f"{ua.os.family} {ua.os.version_string}",
        'is_bot': ua.is_bot,
    }
