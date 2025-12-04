# -*- coding: utf-8 -*-
"""
Test Verisi Olusturma Scripti
Windows icin UTF-8 encoding ile
"""

from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import random

# Models
from apps.accounts.models import AuthorProfile
from apps.categories.models import Category
from apps.tags.models import Tag
from apps.articles.models import Article
from apps.comments.models import Comment
from apps.interactions.models import Like, Share
from apps.bookmarks.models import BookmarkFolder, Bookmark, ReadingHistory, ReadingList, ReadingListItem
from apps.newsletter.models import Subscriber
from apps.core.models import ContactMessage, SiteSettings
from apps.advertisements.models import (
    AdvertisementZone, Advertiser, Campaign, Advertisement
)

User = get_user_model()

print("=" * 60)
print("TEST VERILERI OLUSTURULUYOR...")
print("=" * 60)

# Kullanicilar
print("\n1. Kullanicilar olusturuluyor...")

users_data = [
    {'email': 'admin@haber.com', 'username': 'admin1', 'first_name': 'Admin', 'last_name': 'User', 'password': 'admin123', 'is_staff': True, 'is_superuser': True},
    {'email': 'mehmet@haber.com', 'username': 'mehmet', 'first_name': 'Mehmet', 'last_name': 'Yilmaz', 'password': 'editor123', 'is_staff': True},
    {'email': 'ayse@haber.com', 'username': 'ayse', 'first_name': 'Ayse', 'last_name': 'Demir', 'password': 'editor123', 'is_staff': True},
    {'email': 'ali@haber.com', 'username': 'ali', 'first_name': 'Ali', 'last_name': 'Kaya', 'password': 'editor123', 'is_staff': True},
]

normal_users = [
    {'email': f'user{i}@test.com', 'username': f'user{i}', 'first_name': f'User{i}', 'last_name': 'Test', 'password': 'user123'}
    for i in range(1, 11)
]

for user_data in users_data + normal_users:
    user, created = User.objects.get_or_create(
        email=user_data['email'],
        defaults={k: v for k, v in user_data.items() if k != 'password'}
    )
    if created:
        user.set_password(user_data['password'])
        user.save()
        print(f"OK Kullanici: {user.email}")

# Yazar profilleri
print("\n2. Yazar profilleri olusturuluyor...")

authors_data = [
    {'user_email': 'mehmet@haber.com', 'bio': 'Ekonomi muhabiri. 15 yillik deneyim.', 'title': 'Ekonomi Editoru'},
    {'user_email': 'ayse@haber.com', 'bio': 'Teknoloji yazari. AI ve yazilim uzmani.', 'title': 'Teknoloji Editoru'},
    {'user_email': 'ali@haber.com', 'bio': 'Spor muhabiri. Futbol ve basketbol uzmani.', 'title': 'Spor Editoru'},
]

for author_data in authors_data:
    user = User.objects.get(email=author_data.pop('user_email'))
    author, created = AuthorProfile.objects.get_or_create(
        user=user,
        defaults=author_data
    )
    if created:
        print(f"OK Yazar: {user.get_full_name()}")

# Site ayarlari
print("\n3. Site ayarlari olusturuluyor...")

site_settings, created = SiteSettings.objects.get_or_create(
    id=1,
    defaults={
        'site_name': 'Guncel Haber',
        'site_description': 'Guncel haberler',
        'contact_email': 'info@haber.com',
        'contact_phone': '+90 212 555 0000',
        'address': 'Istanbul, Turkiye',
        'items_per_page': 20,
    }
)
if created:
    print("OK Site ayarlari")

# Kategoriler
print("\n4. Kategoriler olusturuluyor...")

categories_data = [
    {'name': 'Gundem', 'slug': 'gundem', 'description': 'Guncel haberler', 'color': '#E53E3E'},
    {'name': 'Dunya', 'slug': 'dunya', 'description': 'Dunya haberleri', 'color': '#3182CE'},
    {'name': 'Ekonomi', 'slug': 'ekonomi', 'description': 'Ekonomi haberleri', 'color': '#38A169'},
    {'name': 'Spor', 'slug': 'spor', 'description': 'Spor haberleri', 'color': '#DD6B20'},
    {'name': 'Teknoloji', 'slug': 'teknoloji', 'description': 'Teknoloji haberleri', 'color': '#805AD5'},
    {'name': 'Saglik', 'slug': 'saglik', 'description': 'Saglik haberleri', 'color': '#D53F8C'},
    {'name': 'Egitim', 'slug': 'egitim', 'description': 'Egitim haberleri', 'color': '#319795'},
    {'name': 'Kultur', 'slug': 'kultur', 'description': 'Kultur haberleri', 'color': '#D69E2E'},
]

categories = {}
for i, cat_data in enumerate(categories_data):
    cat, created = Category.objects.get_or_create(
        slug=cat_data['slug'],
        defaults={**cat_data, 'order': i}
    )
    categories[cat.slug] = cat
    if created:
        print(f"OK Kategori: {cat.name}")

# Alt kategoriler
sub_cats = [
    {'name': 'Politika', 'slug': 'politika', 'parent': 'gundem'},
    {'name': 'Futbol', 'slug': 'futbol', 'parent': 'spor'},
    {'name': 'Basketbol', 'slug': 'basketbol', 'parent': 'spor'},
]

for cat_data in sub_cats:
    parent_slug = cat_data.pop('parent')
    cat, created = Category.objects.get_or_create(
        slug=cat_data['slug'],
        defaults={**cat_data, 'parent': categories[parent_slug]}
    )
    if created:
        print(f"OK Alt kategori: {cat.name}")

# Etiketler
print("\n5. Etiketler olusturuluyor...")

tags_list = [
    'son dakika', 'onemli', 'analiz', 'video', 'fotograf',
    'roportaj', 'ozel haber', 'secim', 'deprem', 'ekonomik kriz',
    'enflasyon', 'faiz', 'doviz', 'kripto', 'yapay zeka',
    'uzay', 'iklim', 'cevre', 'milli takim', 'super lig',
    'transfer', 'egitim reformu', 'universite', 'saglik',
    'film', 'dizi', 'muzik', 'konser', 'turizm', 'yemek',
]

tags = []
for tag_name in tags_list:
    tag, created = Tag.objects.get_or_create(name=tag_name)
    tags.append(tag)
    if created:
        print(f"OK Etiket: {tag.name}")

# Haberler
print("\n6. Haberler olusturuluyor...")

articles_data = [
    {
        'title': 'Ekonomide Yeni Donem Basliyor',
        'subtitle': 'Merkez Bankasi onemli kararlari acikladi',
        'summary': 'Ekonomi uzmanlarinin degerlendirecegi onemli kararlar alindi. Piyasalar olumlu tepki verdi.',
        'content': '<h2>Ekonomi Haberi</h2><p>Merkez Bankasi Para Politikasi Kurulu toplantisi gerceklesti.</p><p>Piyasalar karari olumlu karsiladi.</p>',
        'category': 'ekonomi',
        'author': 'mehmet@haber.com',
        'tags': ['son dakika', 'ekonomik kriz', 'faiz'],
        'is_featured': True,
        'is_trending': True,
        'views': 15420,
        'hours_ago': 2,
    },
    {
        'title': 'Son Dakika: Istanbul Deprem Tatitkati',
        'subtitle': '10 bin kisi katildi',
        'summary': 'AFAD koordinasyonunda buyuk deprem tatitkati yapildi.',
        'content': '<h2>Deprem Tatitkati</h2><p>Istanbul genelinde deprem tatitkati duzenlendi.</p>',
        'category': 'gundem',
        'author': 'admin@haber.com',
        'tags': ['son dakika', 'deprem'],
        'is_breaking': True,
        'views': 28750,
        'hours_ago': 1,
    },
    {
        'title': 'Yapay Zeka Dunyayi Degistiriyor',
        'subtitle': 'ChatGPT ve yeni AI modelleri',
        'summary': 'Yapay zeka teknolojileri her gecen gun gelisiyor. Uzmanlar 5 yil icinde buyuk degisimler bekliyor.',
        'content': '<h2>AI Devrimi</h2><p>ChatGPT ile baslayan surecte buyuk gelismeler yasaniyor.</p>',
        'category': 'teknoloji',
        'author': 'ayse@haber.com',
        'tags': ['yapay zeka', 'video'],
        'has_video': True,
        'video_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'is_featured': True,
        'views': 12340,
        'hours_ago': 5,
    },
    {
        'title': 'Super Ligde Sampiyonluk Yarisi',
        'subtitle': 'Bas baslara 3 takim',
        'summary': 'Puan cetvelinde ilk 3 takim arasinda sadece 2 puan fark var.',
        'content': '<h2>Futbol Haberi</h2><p>Super Ligde heyecan dorukta.</p>',
        'category': 'spor',
        'author': 'ali@haber.com',
        'tags': ['futbol', 'super lig'],
        'is_trending': True,
        'views': 8920,
        'hours_ago': 3,
    },
    {
        'title': 'Saglik Bakanligindan Grip Asisi Uyarisi',
        'subtitle': 'Risk grubundaki vatandaslar asi olmaya davet edildi',
        'summary': 'Ucretsiz asi kampanyasi devam ediyor.',
        'content': '<h2>Saglik Haberi</h2><p>Grip asisi kampanyasi basladi.</p>',
        'category': 'saglik',
        'author': 'admin@haber.com',
        'tags': ['saglik'],
        'views': 5430,
        'hours_ago': 8,
    },
]

created_articles = []
for article_data in articles_data:
    category = Category.objects.get(slug=article_data.pop('category'))
    author = AuthorProfile.objects.get(user__email=article_data.pop('author'))
    tag_names = article_data.pop('tags', [])
    hours_ago = article_data.pop('hours_ago', 24)
    views = article_data.pop('views', 100)
    
    article, created = Article.objects.get_or_create(
        title=article_data['title'],
        defaults={
            **article_data,
            'author': author,
            'category': category,
            'status': 'published',
            'published_at': timezone.now() - timedelta(hours=hours_ago),
            'views_count': views,
        }
    )
    
    if created:
        for tag_name in tag_names:
            tag = Tag.objects.get(name=tag_name)
            article.tags.add(tag)
        created_articles.append(article)
        print(f"OK Haber: {article.title[:40]}...")

# Ek haberler
print("\n7. Ek haberler olusturuluyor...")
for i in range(20):
    category = random.choice(list(categories.values()))
    author = random.choice(AuthorProfile.objects.all())
    
    article, created = Article.objects.get_or_create(
        title=f"Ornek Haber Basligi {i+1}: {category.name} Haberi",
        defaults={
            'subtitle': f"Alt baslik {i+1}",
            'summary': f"Bu {category.name} kategorisinden test haberidir.",
            'content': f"<p>Test icerigi {i+1}</p>",
            'author': author,
            'category': category,
            'status': 'published',
            'published_at': timezone.now() - timedelta(hours=random.randint(1, 168)),
            'views_count': random.randint(50, 5000),
        }
    )
    
    if created:
        random_tags = random.sample(tags, k=random.randint(2, 5))
        article.tags.add(*random_tags)
        if i < 3:
            print(f"OK Ek haber: {article.title[:40]}...")

# Yorumlar
print("\n8. Yorumlar olusturuluyor...")

comments = [
    "Cok guzel bir haber, bilgilendirici.",
    "Emegi gecen herkese tesekkurler.",
    "Bu konu hakkinda daha fazla yazi bekliyoruz.",
    "Harika analiz, tebrikler.",
]

normal_users_list = User.objects.filter(is_staff=False)
published_articles = Article.objects.filter(status='published')

for article in published_articles[:10]:
    for _ in range(random.randint(2, 5)):
        user = random.choice(normal_users_list)
        content = random.choice(comments)
        
        Comment.objects.get_or_create(
            article=article,
            user=user,
            content=content,
            defaults={'is_approved': True}
        )

print(f"OK {Comment.objects.count()} yorum olusturuldu")

# Begeniler ve Paylasimlar
print("\n9. Begeniler ve Paylasimlar olusturuluyor...")

for article in published_articles[:15]:
    like_count = random.randint(10, 50)
    sample_users = random.sample(list(normal_users_list), min(like_count, len(normal_users_list)))
    
    for user in sample_users:
        Like.objects.get_or_create(user=user, article=article)
    
    platforms = ['facebook', 'twitter', 'whatsapp', 'email']
    for _ in range(random.randint(5, 15)):
        Share.objects.get_or_create(
            article=article,
            platform=random.choice(platforms),
            defaults={'user': random.choice(normal_users_list) if random.random() > 0.3 else None}
        )

print(f"OK {Like.objects.count()} begeni")
print(f"OK {Share.objects.count()} paylasim")

# Bookmarklar
print("\n10. Bookmarklar olusturuluyor...")

for user in normal_users_list[:5]:
    folder, _ = BookmarkFolder.objects.get_or_create(
        user=user,
        name="Favorilerim",
        defaults={'color': '#3B82F6', 'is_default': True}
    )
    
    for article in random.sample(list(published_articles), min(5, len(published_articles))):
        Bookmark.objects.get_or_create(
            user=user,
            article=article,
            defaults={'folder': folder}
        )
    
    for article in random.sample(list(published_articles), min(8, len(published_articles))):
        ReadingHistory.objects.get_or_create(
            user=user,
            article=article,
            defaults={'read_percentage': random.randint(30, 100)}
        )

print(f"OK {Bookmark.objects.count()} bookmark")
print(f"OK {ReadingHistory.objects.count()} okuma gecmisi")

# Reklam sistemi
print("\n11. Reklam sistemi olusturuluyor...")

zones_data = [
    {'name': 'Anasayfa Ust Banner', 'zone_type': 'banner_top', 'width': 970, 'height': 250},
    {'name': 'Sidebar Ust', 'zone_type': 'sidebar_top', 'width': 300, 'height': 250},
    {'name': 'Makale Ici', 'zone_type': 'in_article_middle', 'width': 728, 'height': 90},
]

for zone_data in zones_data:
    zone, created = AdvertisementZone.objects.get_or_create(
        name=zone_data['name'],
        defaults=zone_data
    )
    if created:
        print(f"OK Reklam bolgesi: {zone.name}")

# Reklamverenler
advertisers_data = [
    {'name': 'TechMart', 'email': 'reklam@techmart.com', 'phone': '+90 212 555 0001'},
    {'name': 'FastFood', 'email': 'reklam@fastfood.com', 'phone': '+90 212 555 0002'},
]

for adv_data in advertisers_data:
    advertiser, created = Advertiser.objects.get_or_create(
        email=adv_data['email'],
        defaults=adv_data
    )
    if created:
        print(f"OK Reklamveren: {advertiser.name}")
        
        # Kampanya
        campaign, _ = Campaign.objects.get_or_create(
            name=f"{advertiser.name} Kampanyasi",
            defaults={
                'advertiser': advertiser,
                'status': 'active',
                'pricing_model': 'cpm',
                'budget': 10000,
                'cpm_price': 3.50,
                'start_date': timezone.now() - timedelta(days=10),
                'end_date': timezone.now() + timedelta(days=20),
            }
        )
        
        # Reklam
        zone = AdvertisementZone.objects.first()
        ad, _ = Advertisement.objects.get_or_create(
            name=f"{advertiser.name} Reklami",
            defaults={
                'campaign': campaign,
                'zone': zone,
                'ad_type': 'html',
                'html_content': f'<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;"><h3>{advertiser.name}</h3><p>Ozel kampanya!</p></div>',
                'target_url': 'https://example.com',
                'priority': 50,
            }
        )
        print(f"OK Reklam: {ad.name}")

# Newsletter
print("\n12. Newsletter aboneleri olusturuluyor...")
for i in range(20):
    Subscriber.objects.get_or_create(
        email=f"abone{i}@test.com",
        defaults={'is_active': True}
    )

print(f"OK {Subscriber.objects.count()} abone")

# Iletisim mesajlari
print("\n13. Iletisim mesajlari olusturuluyor...")
messages = [
    {'name': 'Ahmet Yildiz', 'email': 'ahmet@test.com', 'subject': 'Haber onerisi', 'message': 'Merhaba, yeni haber onerisi...'},
    {'name': 'Ayse Kara', 'email': 'ayse@test.com', 'subject': 'Teknik sorun', 'message': 'Web sitesinde sorun var...'},
]

for msg in messages:
    ContactMessage.objects.get_or_create(
        email=msg['email'],
        subject=msg['subject'],
        defaults=msg
    )

print(f"OK {ContactMessage.objects.count()} mesaj")

# OZET
print("\n" + "=" * 60)
print("TEST VERILERI BASARIYLA OLUSTURULDU!")
print("=" * 60)

print(f"\nISTATISTIKLER:")
print(f"  Kullanicilar: {User.objects.count()}")
print(f"  Kategoriler: {Category.objects.count()}")
print(f"  Etiketler: {Tag.objects.count()}")
print(f"  Haberler: {Article.objects.count()}")
print(f"    - Yayinda: {Article.objects.filter(status='published').count()}")
print(f"    - Manset: {Article.objects.filter(is_featured=True).count()}")
print(f"    - Son Dakika: {Article.objects.filter(is_breaking=True).count()}")
print(f"  Yorumlar: {Comment.objects.count()}")
print(f"  Begeniler: {Like.objects.count()}")
print(f"  Paylasimlar: {Share.objects.count()}")
print(f"  Bookmarklar: {Bookmark.objects.count()}")
print(f"  Reklamlar: {Advertisement.objects.count()}")
print(f"  Newsletter: {Subscriber.objects.count()}")

print(f"\nGIRIS BILGILERI:")
print(f"  Admin: admin@haber.com / admin123")
print(f"  Kullanici: user1@test.com / user123")

print(f"\nTEST URLLERI:")
print(f"  Admin: http://localhost:8000/admin/")
print(f"  API: http://localhost:8000/api/docs/")
print(f"  Haberler: http://localhost:8000/api/v1/articles/")

print("\n" + "=" * 60)
print("FRONTEND GELISTIRMEYE BASLAYABILIRSINIZ!")
print("=" * 60)