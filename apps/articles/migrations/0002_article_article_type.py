# Generated manually on 2026-01-15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('articles', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='article',
            name='article_type',
            field=models.CharField(
                choices=[
                    ('news', 'Haber'),
                    ('column', 'Köşe Yazısı'),
                    ('analysis', 'Analiz'),
                    ('interview', 'Röportaj'),
                    ('report', 'Özel Rapor'),
                    ('opinion', 'Yorum'),
                ],
                default='news',
                max_length=20,
                verbose_name='Makale Tipi',
                db_index=True
            ),
        ),
    ]
