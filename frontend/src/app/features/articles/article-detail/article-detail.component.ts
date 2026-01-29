/**
 * Article Detail Component (Smart)
 *
 * View article details in admin panel
 */

import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Services
import { ArticleService } from '../services/article.service';

// Components
import { CardComponent } from '../../../shared/ui/card/card.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

// Pipes
import { DateAgoPipe } from '../../../shared/pipes/date-ago.pipe';

// Types & Constants
import { Article } from '../../../shared/models/article.types';
import { ADMIN_ROUTES } from '../../../shared/constants/routes.constants';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    CardComponent,
    SpinnerComponent,
    ButtonComponent,
    DateAgoPipe,
  ],
  template: `
    <div class="space-y-6">
      @if (loading()) {
        <div class="flex items-center justify-center py-12">
          <app-spinner size="lg"></app-spinner>
        </div>
      } @else if (article()) {
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900">{{ article()!.title }}</h1>
          <div class="flex items-center space-x-3">
            <a
              [routerLink]="['/admin/articles', article()!.id, 'edit']"
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Düzenle
            </a>
            <a
              [routerLink]="articlesRoute"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Geri Dön
            </a>
          </div>
        </div>

        <!-- Content -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <app-card>
              <div body class="prose max-w-none">
                <div [innerHTML]="article()!.content"></div>
              </div>
            </app-card>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Stats Card -->
            <app-card>
              <div header class="font-semibold text-gray-900">İstatistikler</div>
              <div body class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Görüntülenme</span>
                  <span class="font-medium text-gray-900">{{ article()!.viewCount }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Beğeni</span>
                  <span class="font-medium text-gray-900">{{ article()!.likeCount }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Yorum</span>
                  <span class="font-medium text-gray-900">{{ article()!.commentCount }}</span>
                </div>
              </div>
            </app-card>

            <!-- Meta Info Card -->
            <app-card>
              <div header class="font-semibold text-gray-900">Bilgiler</div>
              <div body class="space-y-3">
                <div>
                  <div class="text-xs text-gray-500 mb-1">Yazar</div>
                  <div class="text-sm font-medium text-gray-900">{{ article()!.author.fullName }}</div>
                </div>
                @if (article()!.category) {
                  <div>
                    <div class="text-xs text-gray-500 mb-1">Kategori</div>
                    <div class="text-sm font-medium text-gray-900">{{ article()!.category.name }}</div>
                  </div>
                }
                <div>
                  <div class="text-xs text-gray-500 mb-1">Oluşturulma</div>
                  <div class="text-sm text-gray-900">{{ article()!.createdAt | dateAgo }}</div>
                </div>
                <div>
                  <div class="text-xs text-gray-500 mb-1">Güncellenme</div>
                  <div class="text-sm text-gray-900">{{ article()!.updatedAt | dateAgo }}</div>
                </div>
              </div>
            </app-card>
          </div>
        </div>
      } @else {
        <app-card>
          <div body class="py-12 text-center text-gray-500">
            Makale bulunamadı
          </div>
        </app-card>
      }
    </div>
  `,
})
export class ArticleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly articleService = inject(ArticleService);

  protected readonly articlesRoute = ADMIN_ROUTES.articles;

  article = signal<Article | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadArticle(+id);
    }
  }

  private loadArticle(id: number): void {
    this.articleService.getArticle(id)
      .pipe(takeUntilDestroyed())
      .subscribe(article => {
        this.article.set(article);
        this.loading.set(false);
      });
  }
}
