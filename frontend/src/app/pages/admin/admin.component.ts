import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../services/article.service';
import { CommentService } from '../../services/comment.service';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../core/auth/auth.service';
import { Article } from '../../models/article.model';
import { Comment } from '../../models/comment.model';

interface DashboardStats {
  total_articles: number;
  published_articles: number;
  pending_articles: number;
  draft_articles: number;
  total_views: number;
  total_comments: number;
  pending_comments: number;
  total_users: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Header -->
      <header class="bg-white shadow">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-800">Yönetim Paneli</h1>
              <p class="text-sm text-gray-500">Hoş geldiniz, {{ currentUser()?.first_name || currentUser()?.username }}</p>
            </div>
            <div class="flex items-center gap-4">
              <a routerLink="/admin/articles/new"
                 class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                + Yeni Haber
              </a>
            </div>
          </div>
        </div>
      </header>

      <div class="container mx-auto px-4 py-6">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Total Articles -->
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 mb-1">Toplam Haber</p>
                <p class="text-3xl font-bold text-gray-800">{{ stats()?.total_articles || 0 }}</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                </svg>
              </div>
            </div>
            <div class="mt-4 flex items-center gap-4 text-sm">
              <span class="text-green-600">{{ stats()?.published_articles || 0 }} yayında</span>
              <span class="text-yellow-600">{{ stats()?.pending_articles || 0 }} bekliyor</span>
            </div>
          </div>

          <!-- Total Views -->
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 mb-1">Toplam Görüntülenme</p>
                <p class="text-3xl font-bold text-gray-800">{{ formatNumber(stats()?.total_views || 0) }}</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Comments -->
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 mb-1">Yorumlar</p>
                <p class="text-3xl font-bold text-gray-800">{{ stats()?.total_comments || 0 }}</p>
              </div>
              <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </div>
            </div>
            @if ((stats()?.pending_comments || 0) > 0) {
              <div class="mt-4">
                <span class="px-2 py-1 bg-yellow-100 text-yellow-700 text-sm rounded">
                  {{ stats()?.pending_comments }} onay bekliyor
                </span>
              </div>
            }
          </div>

          <!-- Users -->
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 mb-1">Kullanıcılar</p>
                <p class="text-3xl font-bold text-gray-800">{{ stats()?.total_users || 0 }}</p>
              </div>
              <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Pending Articles -->
          <div class="lg:col-span-2 bg-white rounded-lg shadow">
            <div class="p-4 border-b flex items-center justify-between">
              <h2 class="text-lg font-bold text-gray-800">Onay Bekleyen Haberler</h2>
              <a routerLink="/admin/articles" class="text-blue-600 text-sm hover:underline">Tümünü Gör</a>
            </div>
            <div class="p-4">
              @if (loadingArticles()) {
                <div class="space-y-4">
                  @for (i of [1,2,3]; track i) {
                    <div class="flex gap-4 animate-pulse">
                      <div class="w-20 h-16 bg-gray-200 rounded"></div>
                      <div class="flex-1 space-y-2">
                        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  }
                </div>
              } @else if (pendingArticles().length === 0) {
                <div class="text-center py-8 text-gray-500">
                  <p>Onay bekleyen haber yok</p>
                </div>
              } @else {
                <div class="space-y-4">
                  @for (article of pendingArticles(); track article.id) {
                    <div class="flex gap-4 p-3 border rounded-lg hover:bg-gray-50">
                      <div class="w-20 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        @if (article.featured_image) {
                          <img [src]="article.featured_image" [alt]="article.title" class="w-full h-full object-cover">
                        }
                      </div>
                      <div class="flex-1 min-w-0">
                        <h3 class="font-medium text-gray-800 truncate">{{ article.title }}</h3>
                        <p class="text-sm text-gray-500">{{ article.author?.display_name }} - {{ formatDate(article.created_at) }}</p>
                      </div>
                      <div class="flex items-center gap-2">
                        <button (click)="approveArticle(article)"
                                class="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm">
                          Onayla
                        </button>
                        <button (click)="rejectArticle(article)"
                                class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm">
                          Reddet
                        </button>
                        <a [routerLink]="['/admin/articles', article.slug, 'edit']"
                           class="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm">
                          Düzenle
                        </a>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Pending Comments -->
          <div class="bg-white rounded-lg shadow">
            <div class="p-4 border-b flex items-center justify-between">
              <h2 class="text-lg font-bold text-gray-800">Bekleyen Yorumlar</h2>
              <a routerLink="/admin/comments" class="text-blue-600 text-sm hover:underline">Tümünü Gör</a>
            </div>
            <div class="p-4 max-h-96 overflow-y-auto">
              @if (loadingComments()) {
                <div class="space-y-4">
                  @for (i of [1,2,3,4]; track i) {
                    <div class="animate-pulse space-y-2">
                      <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div class="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  }
                </div>
              } @else if (pendingComments().length === 0) {
                <div class="text-center py-8 text-gray-500">
                  <p>Bekleyen yorum yok</p>
                </div>
              } @else {
                <div class="space-y-4">
                  @for (comment of pendingComments(); track comment.id) {
                    <div class="p-3 border rounded-lg">
                      <div class="flex items-center justify-between mb-2">
                        <span class="font-medium text-sm text-gray-800">
                          {{ comment.user?.first_name || comment.name || 'Anonim' }}
                        </span>
                        <span class="text-xs text-gray-400">{{ formatDate(comment.created_at) }}</span>
                      </div>
                      <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ comment.content }}</p>
                      <div class="flex items-center gap-2">
                        <button (click)="approveComment(comment.id)"
                                class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">
                          Onayla
                        </button>
                        <button (click)="rejectComment(comment.id)"
                                class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">
                          Reddet
                        </button>
                        <button (click)="markAsSpam(comment.id)"
                                class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200">
                          Spam
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Recent Articles -->
        <div class="mt-6 bg-white rounded-lg shadow">
          <div class="p-4 border-b flex items-center justify-between">
            <h2 class="text-lg font-bold text-gray-800">Son Yayınlanan Haberler</h2>
            <a routerLink="/admin/articles" class="text-blue-600 text-sm hover:underline">Tümünü Gör</a>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Başlık</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Yazar</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Görüntülenme</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                @for (article of recentArticles(); track article.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          @if (article.featured_image) {
                            <img [src]="article.featured_image" [alt]="article.title" class="w-full h-full object-cover">
                          }
                        </div>
                        <span class="font-medium text-gray-800 truncate max-w-xs">{{ article.title }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ article.category?.name }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ article.author?.display_name }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ article.views_count }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500">{{ formatDate(article.published_at) }}</td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <a [routerLink]="['/articles', article.slug]"
                           target="_blank"
                           class="text-blue-600 hover:underline text-sm">Görüntüle</a>
                        <a [routerLink]="['/admin/articles', article.slug, 'edit']"
                           class="text-gray-600 hover:underline text-sm">Düzenle</a>
                        <button (click)="deleteArticle(article)"
                                class="text-red-600 hover:underline text-sm">Sil</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <a routerLink="/admin/articles/new"
             class="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <span class="font-medium text-gray-800">Yeni Haber</span>
          </a>
          <a routerLink="/admin/articles"
             class="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <span class="font-medium text-gray-800">Tüm Haberler</span>
          </a>
          <a routerLink="/admin/comments"
             class="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
              </svg>
            </div>
            <span class="font-medium text-gray-800">Yorumlar</span>
          </a>
          <a routerLink="/admin/categories"
             class="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
              </svg>
            </div>
            <span class="font-medium text-gray-800">Kategoriler</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class AdminComponent implements OnInit {
  private articleService = inject(ArticleService);
  private commentService = inject(CommentService);
  private analyticsService = inject(AnalyticsService);
  private authService = inject(AuthService);

  // State
  currentUser = this.authService.currentUserSignal;
  stats = signal<DashboardStats | null>(null);
  pendingArticles = signal<Article[]>([]);
  recentArticles = signal<Article[]>([]);
  pendingComments = signal<Comment[]>([]);
  loadingArticles = signal(true);
  loadingComments = signal(true);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Load stats
    this.analyticsService.getDashboard().subscribe({
      next: (data: any) => {
        this.stats.set({
          total_articles: data.total_articles || 0,
          published_articles: data.published_articles || 0,
          pending_articles: data.pending_articles || 0,
          draft_articles: data.draft_articles || 0,
          total_views: data.total_views || 0,
          total_comments: data.total_comments || 0,
          pending_comments: data.pending_comments || 0,
          total_users: data.total_users || 0,
        });
      },
      error: (err) => console.error('Error loading stats:', err)
    });

    // Load pending articles
    this.articleService.getArticles({ status: 'pending', limit: 5 }).subscribe({
      next: (response) => {
        this.pendingArticles.set(response.results);
        this.loadingArticles.set(false);
      },
      error: (err) => {
        console.error('Error loading pending articles:', err);
        this.loadingArticles.set(false);
      }
    });

    // Load recent articles
    this.articleService.getArticles({ status: 'published', limit: 10, ordering: '-published_at' }).subscribe({
      next: (response) => {
        this.recentArticles.set(response.results);
      },
      error: (err) => console.error('Error loading recent articles:', err)
    });

    // Load pending comments
    this.commentService.getModerationQueue({ limit: 10 }).subscribe({
      next: (response) => {
        this.pendingComments.set(response.results);
        this.loadingComments.set(false);
      },
      error: (err) => {
        console.error('Error loading pending comments:', err);
        this.loadingComments.set(false);
      }
    });
  }

  approveArticle(article: Article): void {
    this.articleService.updateArticle(article.slug, { status: 'published' }).subscribe({
      next: () => {
        const current = this.pendingArticles();
        this.pendingArticles.set(current.filter(a => a.id !== article.id));

        // Update stats
        const currentStats = this.stats();
        if (currentStats) {
          this.stats.set({
            ...currentStats,
            pending_articles: currentStats.pending_articles - 1,
            published_articles: currentStats.published_articles + 1
          });
        }
      },
      error: (err) => console.error('Error approving article:', err)
    });
  }

  rejectArticle(article: Article): void {
    if (!confirm('Bu haberi reddetmek istediğinize emin misiniz?')) return;

    this.articleService.updateArticle(article.slug, { status: 'draft' }).subscribe({
      next: () => {
        const current = this.pendingArticles();
        this.pendingArticles.set(current.filter(a => a.id !== article.id));

        const currentStats = this.stats();
        if (currentStats) {
          this.stats.set({
            ...currentStats,
            pending_articles: currentStats.pending_articles - 1,
            draft_articles: currentStats.draft_articles + 1
          });
        }
      },
      error: (err) => console.error('Error rejecting article:', err)
    });
  }

  deleteArticle(article: Article): void {
    if (!confirm('Bu haberi silmek istediğinize emin misiniz?')) return;

    this.articleService.deleteArticle(article.slug).subscribe({
      next: () => {
        const current = this.recentArticles();
        this.recentArticles.set(current.filter(a => a.id !== article.id));

        const currentStats = this.stats();
        if (currentStats) {
          this.stats.set({
            ...currentStats,
            total_articles: currentStats.total_articles - 1,
            published_articles: currentStats.published_articles - 1
          });
        }
      },
      error: (err) => console.error('Error deleting article:', err)
    });
  }

  approveComment(commentId: number): void {
    this.commentService.approveComment(commentId).subscribe({
      next: () => {
        const current = this.pendingComments();
        this.pendingComments.set(current.filter(c => c.id !== commentId));

        const currentStats = this.stats();
        if (currentStats) {
          this.stats.set({
            ...currentStats,
            pending_comments: currentStats.pending_comments - 1
          });
        }
      },
      error: (err) => console.error('Error approving comment:', err)
    });
  }

  rejectComment(commentId: number): void {
    this.commentService.rejectComment(commentId).subscribe({
      next: () => {
        const current = this.pendingComments();
        this.pendingComments.set(current.filter(c => c.id !== commentId));

        const currentStats = this.stats();
        if (currentStats) {
          this.stats.set({
            ...currentStats,
            pending_comments: currentStats.pending_comments - 1
          });
        }
      },
      error: (err) => console.error('Error rejecting comment:', err)
    });
  }

  markAsSpam(commentId: number): void {
    this.commentService.markAsSpam(commentId).subscribe({
      next: () => {
        const current = this.pendingComments();
        this.pendingComments.set(current.filter(c => c.id !== commentId));

        const currentStats = this.stats();
        if (currentStats) {
          this.stats.set({
            ...currentStats,
            pending_comments: currentStats.pending_comments - 1
          });
        }
      },
      error: (err) => console.error('Error marking as spam:', err)
    });
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Az önce';
    if (hours < 24) return `${hours} saat önce`;
    if (days < 7) return `${days} gün önce`;

    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short'
    });
  }
}
