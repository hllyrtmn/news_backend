from django.http import HttpResponse
from django.views.generic import TemplateView
from django.conf import settings


def robots_txt(request):
    """robots.txt dosyası"""
    lines = [
        "User-agent: *",
        "Allow: /",
        "",
        "# Sitemap",
        f"Sitemap: {settings.FRONTEND_URL}/sitemap.xml",
        "",
        "# Disallow paths",
        "Disallow: /admin/",
        "Disallow: /api/",
        "Disallow: /media/private/",
        "",
        "# Crawl delay",
        "Crawl-delay: 1",
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")


def ads_txt(request):
    """ads.txt dosyası - Reklam doğrulama için"""
    lines = [
        "# ads.txt file for advertising verification",
        "# google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0",
        "# Add your advertising partners here",
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")


class HumansView(TemplateView):
    """humans.txt - Site ekibi hakkında bilgi"""
    template_name = "humans.txt"
    content_type = "text/plain"
