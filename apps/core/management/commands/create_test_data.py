# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Test verileri olusturur - GERCEK MODELLERE GORE'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('TEST VERILERI OLUSTURULUYOR...'))
        self.stdout.write(self.style.SUCCESS('=' * 60))

        from apps.accounts.models import AuthorProfile
        from apps.categories.models import Category
        from apps.tags.models import Tag
        from apps.articles.models import Article
        from apps.comments.models import Comment
        from apps.interactions.models import Like, Share
        from apps.bookmarks.models import BookmarkFolder, Bookmark, ReadingHistory
        from apps.core.models import SiteSettings
        from apps.advertisements.models import AdvertisementZone, Advertiser, Campaign, Advertisement

        # 1. KULLANICILAR
        self.stdout.write('\n1. Kullanicilar olusturuluyor...')
        
        users_data = [
            {'email': 'admin@haber.com', 'username': 'admin', 'first_name': 'Admin', 
             'last_name': 'User', 'password': 'admin123', 'is_staff': True, 'is_superuser': True},
            {'email': 'mehmet@haber.com', 'username': 'mehmet', 'first_name': 'Mehmet', 
             'last_name': 'Yilmaz', 'password': 'editor123', 'is_staff': True},
            {'email': 'ayse@haber.com', 'username': 'ayse', 'first_name': 'Ayse', 
             'last_name': 'Demir', 'password': 'editor123', 'is_staff': True},
        ]

        for i in range(1, 11):
            users_data.append({
                'email': f'user{i}@test.com', 'username': f'user{i}',
                'first_name': f'User{i}', 'last_name': 'Test', 'password': 'user123'
            })

        staff_users = []
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults={k: v for k, v in user_data.items() if k != 'password'}
            )
            if created:
                user.set_password(user_data['password'])
                user.save()
                if user.is_staff:
                    staff_users.append(user)
                self.stdout.write(f"  OK {user.email}")

        # YAZAR PROFİLLERİ - display_name ZORUNLU
        for i, user in enumerate(staff_users):
            display_name = f"{user.first_name} {user.last_name}"
            author, created = AuthorProfile.objects.get_or_create(
                user=user,
                defaults={
                    'display_name': display_name,
                    'title': ['Baş Editör', 'Kıdemli Editör', 'Editör'][i % 3],
                    'specialty': ['Ekonomi', 'Teknoloji', 'Genel'][i % 3],
                }
            )
            if created:
                self.stdout.write(f"  OK Yazar: {display_name}")

        # 2. SITE AYARLARI
        self.stdout.write('\n2. Site ayarlari...')
        SiteSettings.objects.get_or_create(
            id=1,
            defaults={
                'site_name': 'Guncel Haber',
                'site_description': 'Turkiyenin guncel haber sitesi',
                'contact_email': 'info@haber.com',
                'items_per_page': 20,
            }
        )
        self.stdout.write("  OK")

        # 3. KATEGORİLER - color_code field'ı var
        self.stdout.write('\n3. Kategoriler...')
        cats_data = [
            {'name': 'Gundem', 'slug': 'gundem', 'description': 'Guncel haberler', 'color_code': '#E53E3E'},
            {'name': 'Ekonomi', 'slug': 'ekonomi', 'description': 'Ekonomi haberleri', 'color_code': '#38A169'},
            {'name': 'Spor', 'slug': 'spor', 'description': 'Spor haberleri', 'color_code': '#DD6B20'},
            {'name': 'Teknoloji', 'slug': 'teknoloji', 'description': 'Teknoloji haberleri', 'color_code': '#805AD5'},
            {'name': 'Saglik', 'slug': 'saglik', 'description': 'Saglik haberleri', 'color_code': '#D53F8C'},
        ]

        for i, cat_data in enumerate(cats_data):
            cat, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults={**cat_data, 'order': i}
            )
            if created:
                self.stdout.write(f"  OK {cat.name}")

        # 4. ETİKETLER
        self.stdout.write('\n4. Etiketler...')
        tags_list = [
            'son dakika', 'onemli', 'analiz', 'video', 
            'ekonomi', 'faiz', 'enflasyon', 
            'yapay zeka', 'teknoloji',
            'futbol', 'basketbol', 'super lig',
            'saglik', 'pandemi',
        ]

        for tag_name in tags_list:
            Tag.objects.get_or_create(name=tag_name)
        self.stdout.write(f"  OK {len(tags_list)} etiket")

        # 5. HABERLER - author ZORUNLU
        self.stdout.write('\n5. Haberler...')
        
        authors = list(AuthorProfile.objects.all())
        if not authors:
            self.stdout.write(self.style.ERROR('  HATA: Yazar profili yok!'))
            return

        articles_data = [
            {
                'title': 'Ekonomide Yeni Donem Basliyor',
                'subtitle': 'Merkez Bankasi onemli kararlari acikladi',
                'summary': 'Ekonomi uzmanlarinin degerlendirecegi onemli kararlar alindi.',
                'content': '<h2>Ekonomi</h2><p>Merkez Bankasi Para Politikasi Kurulu toplantisi.</p>',
                'category': 'ekonomi',
                'tags': ['son dakika', 'ekonomi', 'faiz'],
                'is_featured': True,
                'hours': 2,
            },
            {
                'title': 'Yapay Zeka Devrimi Basliyor',
                'subtitle': 'ChatGPT ve yeni AI modelleri',
                'summary': 'Yapay zeka teknolojileri her gecen gun gelistiriliyor.',
                'content': '<h2>Teknoloji</h2><p>ChatGPT ile baslayan surecte AI gelisiyor.</p>',
                'category': 'teknoloji',
                'tags': ['yapay zeka', 'teknoloji', 'video'],
                'has_video': True,
                'video_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'is_featured': True,
                'hours': 5,
            },
            {
                'title': 'Super Ligde Sampiyonluk Yarisi',
                'subtitle': 'Bas baslara 3 takim',
                'summary': 'Puan cetveli cok yakin.',
                'content': '<h2>Spor</h2><p>Lig son haftalara girerken heyecan dorukta.</p>',
                'category': 'spor',
                'tags': ['futbol', 'super lig'],
                'is_trending': True,
                'hours': 3,
            },
        ]

        tags_objs = list(Tag.objects.all())
        
        for art_data in articles_data:
            category = Category.objects.get(slug=art_data.pop('category'))
            tag_names = art_data.pop('tags', [])
            hours = art_data.pop('hours', 24)
            
            article, created = Article.objects.get_or_create(
                title=art_data['title'],
                defaults={
                    **art_data,
                    'author': random.choice(authors),
                    'category': category,
                    'status': 'published',
                    'published_at': timezone.now() - timedelta(hours=hours),
                    'views_count': random.randint(1000, 15000),
                }
            )

            if created:
                for tag_name in tag_names:
                    try:
                        tag = Tag.objects.get(name=tag_name)
                        article.tags.add(tag)
                    except:
                        pass
                self.stdout.write(f"  OK {article.title[:40]}...")

        # Ek haberler
        categories = list(Category.objects.all())
        
        for i in range(20):
            category = random.choice(categories)
            
            article, created = Article.objects.get_or_create(
                title=f"Test Haberi {i+1}: {category.name} Kategorisi",
                defaults={
                    'subtitle': f"Alt baslik {i+1}",
                    'summary': f"Test ozeti {i+1}",
                    'content': f"<h2>Test</h2><p>Icerik {i+1}</p>",
                    'author': random.choice(authors),
                    'category': category,
                    'status': 'published',
                    'published_at': timezone.now() - timedelta(hours=random.randint(1, 168)),
                    'views_count': random.randint(100, 5000),
                }
            )

            if created:
                article.tags.add(*random.sample(tags_objs, k=min(3, len(tags_objs))))

        self.stdout.write(f"  OK Toplam {Article.objects.count()} haber")

        # 6. YORUMLAR
        self.stdout.write('\n6. Yorumlar...')
        comments = ["Guzel haber", "Tesekkurler", "Cok faydali"]
        users = list(User.objects.filter(is_staff=False))
        articles = list(Article.objects.filter(status='published')[:10])

        if users and articles:
            for article in articles:
                for _ in range(random.randint(2, 5)):
                    Comment.objects.get_or_create(
                        article=article,
                        user=random.choice(users),
                        content=random.choice(comments),
                        status={'approved': True}
                    )
        
        self.stdout.write(f"  OK {Comment.objects.count()} yorum")

        # 7. ETKİLEŞİMLER
        self.stdout.write('\n7. Begeniler/Paylasimlar...')
        
        if users and articles:
            for article in articles:
                for user in random.sample(users, k=min(5, len(users))):
                    Like.objects.get_or_create(user=user, article=article)
                
                for _ in range(random.randint(3, 8)):
                    Share.objects.get_or_create(
                        article=article,
                        platform=random.choice(['facebook', 'twitter', 'whatsapp']),
                        defaults={'user': random.choice(users) if random.random() > 0.3 else None}
                    )

        self.stdout.write(f"  OK {Like.objects.count()} begeni, {Share.objects.count()} paylasim")

        # 8. BOOKMARKLAR
        self.stdout.write('\n8. Bookmarklar...')
        articles_all = list(Article.objects.filter(status='published'))

        if users and articles_all:
            for user in users[:5]:
                folder, _ = BookmarkFolder.objects.get_or_create(
                    user=user,
                    name="Favorilerim",
                    defaults={'is_default': True, 'color': '#3B82F6'}
                )

                for article in random.sample(articles_all, min(5, len(articles_all))):
                    Bookmark.objects.get_or_create(
                        user=user,
                        article=article,
                        defaults={'folder': folder}
                    )

                for article in random.sample(articles_all, min(8, len(articles_all))):
                    ReadingHistory.objects.get_or_create(
                        user=user,
                        article=article,
                        defaults={'read_percentage': random.randint(30, 100)}
                    )

        self.stdout.write(f"  OK {Bookmark.objects.count()} bookmark")

        # 9. REKLAMLAR
        self.stdout.write('\n9. Reklamlar...')
        zones = [
            {'name': 'Ust Banner', 'zone_type': 'banner_top', 'width': 970, 'height': 250},
            {'name': 'Sidebar', 'zone_type': 'sidebar_top', 'width': 300, 'height': 250},
        ]

        for zone_data in zones:
            AdvertisementZone.objects.get_or_create(
                name=zone_data['name'],
                defaults=zone_data
            )

        adv, created = Advertiser.objects.get_or_create(
            email='reklam@test.com',
            defaults={'name': 'Test Sirket', 'phone': '+90 212 555 0000'}
        )

        if created:
            camp, _ = Campaign.objects.get_or_create(
                name="Test Kampanyasi",
                defaults={
                    'advertiser': adv,
                    'status': 'active',
                    'pricing_model': 'cpm',
                    'budget': 10000,
                    'start_date': timezone.now(),
                    'end_date': timezone.now() + timedelta(days=30),
                }
            )

            zone = AdvertisementZone.objects.first()
            if zone:
                Advertisement.objects.get_or_create(
                    name="Test Reklam",
                    defaults={
                        'campaign': camp,
                        'zone': zone,
                        'ad_type': 'html',
                        'html_content': '<div style="background: #667eea; padding: 20px; color: white;">Reklam</div>',
                        'target_url': 'https://example.com',
                    }
                )

        self.stdout.write(f"  OK {Advertisement.objects.count()} reklam")

        # ÖZET
        self.print_summary()

    def print_summary(self):
        from apps.articles.models import Article
        from apps.categories.models import Category
        from apps.tags.models import Tag
        from apps.comments.models import Comment
        from apps.interactions.models import Like, Share
        from apps.bookmarks.models import Bookmark
        
        self.stdout.write(self.style.SUCCESS('\n' + '=' * 60))
        self.stdout.write(self.style.SUCCESS('TAMAMLANDI!'))
        self.stdout.write(self.style.SUCCESS('=' * 60))

        self.stdout.write('\nISTATISTIKLER:')
        self.stdout.write(f"  Kullanicilar: {User.objects.count()}")
        self.stdout.write(f"  Kategoriler: {Category.objects.count()}")
        self.stdout.write(f"  Etiketler: {Tag.objects.count()}")
        self.stdout.write(f"  Haberler: {Article.objects.count()}")
        self.stdout.write(f"    - Yayinda: {Article.objects.filter(status='published').count()}")
        self.stdout.write(f"    - Manset: {Article.objects.filter(is_featured=True).count()}")
        self.stdout.write(f"  Yorumlar: {Comment.objects.count()}")
        self.stdout.write(f"  Begeniler: {Like.objects.count()}")
        self.stdout.write(f"  Bookmarklar: {Bookmark.objects.count()}")

        self.stdout.write('\nGIRIS:')
        self.stdout.write('  admin@haber.com / admin123')
        self.stdout.write('  user1@test.com / user123')

        self.stdout.write('\nURLLER:')
        self.stdout.write('  http://localhost:8000/admin/')
        self.stdout.write('  http://localhost:8000/api/docs/')
        self.stdout.write('  http://localhost:8000/api/v1/articles/')

        self.stdout.write(self.style.SUCCESS('\nFRONTEND GELISTIRMEYE BASLAYABILIRSINIZ!'))