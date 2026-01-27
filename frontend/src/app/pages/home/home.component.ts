import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../services/article.service';
import { CategoryService } from '../../services/category.service';
import { Article } from '../../models/article.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Breaking News Banner -->
      @if (breakingNews().length > 0) {
        <div class="bg-red-600 text-white py-2">
          <div class="container mx-auto px-4">
            <div class="flex items-center gap-4 overflow-hidden">
              <span class="bg-white text-red-600 px-3 py-1 text-sm font-bold rounded whitespace-nowrap">
                SON DAKİKA
              </span>
              <div class="flex-1 overflow-hidden">
                <div class="animate-marquee whitespace-nowrap">
                  @for (news of breakingNews(); track news.id) {
                    <a [routerLink]="['/articles', news.slug]" class="hover:underline mx-8">
                      {{ news.title }}
                    </a>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <div class="container mx-auto px-4 py-6">
        <!-- Hero Section - Featured Articles -->
        <section class="mb-8">
          @if (loading()) {
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div class="lg:col-span-2 h-96 bg-gray-200 animate-pulse rounded-lg"></div>
              <div class="space-y-4">
                <div class="h-44 bg-gray-200 animate-pulse rounded-lg"></div>
                <div class="h-44 bg-gray-200 animate-pulse rounded-lg"></div>
              </div>
            </div>
          } @else if (featuredArticles().length > 0) {
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Main Featured Article -->
              <div class="lg:col-span-2">
                <a [routerLink]="['/articles', featuredArticles()[0].slug]"
                   class="group block relative h-96 rounded-lg overflow-hidden shadow-lg">
                  <img [src]="featuredArticles()[0].featured_image || 'https://via.placeholder.com/800x400'"
                       [alt]="featuredArticles()[0].title"
                       class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <span class="inline-block bg-blue-600 px-3 py-1 text-sm rounded mb-3">
                      {{ featuredArticles()[0].category?.name }}
                    </span>
                    <h2 class="text-2xl lg:text-3xl font-bold mb-2 group-hover:text-blue-300 transition-colors">
                      {{ featuredArticles()[0].title }}
                    </h2>
                    <p class="text-gray-200 line-clamp-2">{{ featuredArticles()[0].summary }}</p>
                    <div class="flex items-center gap-4 mt-3 text-sm text-gray-300">
                      <span>{{ featuredArticles()[0].author?.display_name }}</span>
                      <span>{{ formatDate(featuredArticles()[0].published_at) }}</span>
                      <span>{{ featuredArticles()[0].read_time }} dk okuma</span>
                    </div>
                  </div>
                </a>
              </div>

              <!-- Secondary Featured Articles -->
              <div class="space-y-4">
                @for (article of featuredArticles().slice(1, 3); track article.id) {
                  <a [routerLink]="['/articles', article.slug]"
                     class="group block relative h-44 rounded-lg overflow-hidden shadow-lg">
                    <img [src]="article.featured_image || 'https://via.placeholder.com/400x200'"
                         [alt]="article.title"
                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div class="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <span class="inline-block bg-blue-600 px-2 py-0.5 text-xs rounded mb-2">
                        {{ article.category?.name }}
                      </span>
                      <h3 class="font-bold group-hover:text-blue-300 transition-colors line-clamp-2">
                        {{ article.title }}
                      </h3>
                    </div>
                  </a>
                }
              </div>
            </div>
          }
        </section>

        <!-- Categories Navigation -->
        <section class="mb-8">
          <div class="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
            @for (category of categories(); track category.id) {
              <a [routerLink]="['/category', category.slug]"
                 class="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow hover:shadow-md hover:bg-blue-50 transition-all whitespace-nowrap">
                @if (category.icon) {
                  <i [class]="category.icon"></i>
                }
                <span class="font-medium">{{ category.name }}</span>
              </a>
            }
          </div>
        </section>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-3">
            <!-- Latest Articles -->
            <section class="mb-8">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-bold text-gray-800">Son Haberler</h2>
                <a routerLink="/articles" class="text-blue-600 hover:underline">Tümünü Gör</a>
              </div>

              @if (loading()) {
                <div class="space-y-4">
                  @for (i of [1,2,3,4,5]; track i) {
                    <div class="flex gap-4 bg-white p-4 rounded-lg shadow animate-pulse">
                      <div class="w-32 h-24 bg-gray-200 rounded"></div>
                      <div class="flex-1 space-y-2">
                        <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div class="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="space-y-4">
                  @for (article of latestArticles(); track article.id) {
                    <a [routerLink]="['/articles', article.slug]"
                       class="group flex gap-4 bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                      <div class="relative w-32 h-24 flex-shrink-0">
                        <img [src]="article.featured_image || 'https://via.placeholder.com/128x96'"
                             [alt]="article.title"
                             class="w-full h-full object-cover rounded">
                        @if (article.has_video) {
                          <div class="absolute inset-0 flex items-center justify-center bg-black/30 rounded">
                            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        }
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="text-xs font-medium text-blue-600">{{ article.category?.name }}</span>
                          @if (article.is_trending) {
                            <span class="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">Trend</span>
                          }
                        </div>
                        <h3 class="font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {{ article.title }}
                        </h3>
                        <p class="text-sm text-gray-500 line-clamp-1 mt-1">{{ article.summary }}</p>
                        <div class="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>{{ article.author?.display_name }}</span>
                          <span>{{ formatDate(article.published_at) }}</span>
                          <span>{{ article.views_count }} görüntülenme</span>
                        </div>
                      </div>
                    </a>
                  }
                </div>
              }

              <!-- Load More Button -->
              @if (latestArticles().length > 0) {
                <div class="text-center mt-6">
                  <button (click)="loadMoreArticles()"
                          [disabled]="loadingMore()"
                          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    @if (loadingMore()) {
                      <span>Yükleniyor...</span>
                    } @else {
                      <span>Daha Fazla Göster</span>
                    }
                  </button>
                </div>
              }
            </section>
          </div>

          <!-- Sidebar -->
          <aside class="lg:col-span-1 space-y-6">
            <!-- Trending Articles -->
            <div class="bg-white rounded-lg shadow p-4">
              <h3 class="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Gündemde</h3>
              @if (loading()) {
                <div class="space-y-3">
                  @for (i of [1,2,3,4,5]; track i) {
                    <div class="flex gap-3 animate-pulse">
                      <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div class="flex-1 space-y-1">
                        <div class="h-4 bg-gray-200 rounded w-full"></div>
                        <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="space-y-3">
                  @for (article of trendingArticles(); track article.id; let i = $index) {
                    <a [routerLink]="['/articles', article.slug]"
                       class="group flex gap-3 items-start hover:bg-gray-50 p-2 rounded transition-colors">
                      <span class="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 font-bold rounded-full text-sm">
                        {{ i + 1 }}
                      </span>
                      <div class="flex-1 min-w-0">
                        <h4 class="font-medium text-sm text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {{ article.title }}
                        </h4>
                        <span class="text-xs text-gray-400">{{ article.views_count }} okuma</span>
                      </div>
                    </a>
                  }
                </div>
              }
            </div>

            <!-- Popular Categories -->
            <div class="bg-white rounded-lg shadow p-4">
              <h3 class="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Popüler Kategoriler</h3>
              <div class="space-y-2">
                @for (category of categories().slice(0, 8); track category.id) {
                  <a [routerLink]="['/category', category.slug]"
                     class="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors">
                    <span class="font-medium text-gray-700">{{ category.name }}</span>
                    @if (category.article_count) {
                      <span class="text-sm text-gray-400">{{ category.article_count }} haber</span>
                    }
                  </a>
                }
              </div>
            </div>

            <!-- Newsletter Signup -->
            <div class="bg-blue-600 rounded-lg shadow p-4 text-white">
              <h3 class="font-bold text-lg mb-2">Bültenimize Katılın</h3>
              <p class="text-sm text-blue-100 mb-4">Güncel haberleri e-posta ile alın.</p>
              <form (submit)="subscribeNewsletter($event)" class="space-y-2">
                <input type="email"
                       [(ngModel)]="newsletterEmail"
                       name="newsletterEmail"
                       placeholder="E-posta adresiniz"
                       class="w-full px-3 py-2 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                       required>
                <button type="submit"
                        class="w-full py-2 bg-white text-blue-600 font-medium rounded hover:bg-blue-50 transition-colors">
                  Abone Ol
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-marquee {
      animation: marquee 30s linear infinite;
    }

    @keyframes marquee {
      0% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }

    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }

    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class HomeComponent implements OnInit {
  private articleService = inject(ArticleService);
  private categoryService = inject(CategoryService);

  // Signals for reactive state
  loading = signal(true);
  loadingMore = signal(false);
  featuredArticles = signal<Article[]>([]);
  breakingNews = signal<Article[]>([]);
  latestArticles = signal<Article[]>([]);
  trendingArticles = signal<Article[]>([]);
  categories = signal<Category[]>([]);

  newsletterEmail = '';
  currentPage = 1;

  ngOnInit(): void {
    this.loadHomeData();
  }

  loadHomeData(): void {
    this.loading.set(true);

    // Load all data in parallel
    Promise.all([
      this.loadFeaturedArticles(),
      this.loadBreakingNews(),
      this.loadLatestArticles(),
      this.loadTrendingArticles(),
      this.loadCategories()
    ]).finally(() => {
      this.loading.set(false);
    });
  }

  private async loadFeaturedArticles(): Promise<void> {
    try {
      const articles = await this.articleService.getFeaturedArticles(5).toPromise();
      this.featuredArticles.set(articles || []);
    } catch (error) {
      console.error('Error loading featured articles:', error);
    }
  }

  private async loadBreakingNews(): Promise<void> {
    try {
      const news = await this.articleService.getBreakingNews(5).toPromise();
      this.breakingNews.set(news || []);
    } catch (error) {
      console.error('Error loading breaking news:', error);
    }
  }

  private async loadLatestArticles(): Promise<void> {
    try {
      const response = await this.articleService.getArticles({
        page: 1,
        limit: 10,
        ordering: '-published_at'
      }).toPromise();
      this.latestArticles.set(response?.results || []);
    } catch (error) {
      console.error('Error loading latest articles:', error);
    }
  }

  private async loadTrendingArticles(): Promise<void> {
    try {
      const articles = await this.articleService.getTrendingArticles(10).toPromise();
      this.trendingArticles.set(articles || []);
    } catch (error) {
      console.error('Error loading trending articles:', error);
    }
  }

  private async loadCategories(): Promise<void> {
    try {
      const cats = await this.categoryService.getCategories().toPromise();
      this.categories.set(cats || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  loadMoreArticles(): void {
    if (this.loadingMore()) return;

    this.loadingMore.set(true);
    this.currentPage++;

    this.articleService.getArticles({
      page: this.currentPage,
      limit: 10,
      ordering: '-published_at'
    }).subscribe({
      next: (response) => {
        const current = this.latestArticles();
        this.latestArticles.set([...current, ...response.results]);
        this.loadingMore.set(false);
      },
      error: () => {
        this.loadingMore.set(false);
        this.currentPage--;
      }
    });
  }

  subscribeNewsletter(event: Event): void {
    event.preventDefault();
    if (!this.newsletterEmail) return;

    // TODO: Implement newsletter subscription
    console.log('Subscribe:', this.newsletterEmail);
    alert('Bültenimize abone oldunuz!');
    this.newsletterEmail = '';
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
      month: 'long',
      year: 'numeric'
    });
  }
}
