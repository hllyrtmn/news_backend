import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ArticleService } from '../../services/article.service';
import { CommentService } from '../../services/comment.service';
import { BookmarkService } from '../../services/bookmark.service';
import { AuthService } from '../../core/auth/auth.service';
import { Article } from '../../models/article.model';
import { Comment } from '../../models/comment.model';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      @if (loading()) {
        <!-- Loading Skeleton -->
        <div class="container mx-auto px-4 py-8">
          <div class="max-w-4xl mx-auto">
            <div class="animate-pulse space-y-4">
              <div class="h-8 bg-gray-200 rounded w-3/4"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              <div class="h-96 bg-gray-200 rounded"></div>
              <div class="space-y-2">
                <div class="h-4 bg-gray-200 rounded"></div>
                <div class="h-4 bg-gray-200 rounded"></div>
                <div class="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      } @else if (error()) {
        <!-- Error State -->
        <div class="container mx-auto px-4 py-8">
          <div class="max-w-4xl mx-auto text-center">
            <div class="text-6xl mb-4">😕</div>
            <h1 class="text-2xl font-bold text-gray-800 mb-2">Haber Bulunamadı</h1>
            <p class="text-gray-600 mb-4">{{ error() }}</p>
            <a routerLink="/" class="text-blue-600 hover:underline">Ana Sayfaya Dön</a>
          </div>
        </div>
      } @else if (article()) {
        <article class="container mx-auto px-4 py-8">
          <div class="max-w-4xl mx-auto">
            <!-- Breadcrumb -->
            <nav class="text-sm mb-4">
              <ol class="flex items-center gap-2 text-gray-500">
                <li><a routerLink="/" class="hover:text-blue-600">Ana Sayfa</a></li>
                <li>/</li>
                <li>
                  <a [routerLink]="['/category', article()!.category?.slug]" class="hover:text-blue-600">
                    {{ article()!.category?.name }}
                  </a>
                </li>
                <li>/</li>
                <li class="text-gray-800 truncate max-w-xs">{{ article()!.title }}</li>
              </ol>
            </nav>

            <!-- Article Header -->
            <header class="mb-6">
              <!-- Badges -->
              <div class="flex items-center gap-2 mb-3">
                <span class="px-3 py-1 bg-blue-600 text-white text-sm rounded">
                  {{ article()!.category?.name }}
                </span>
                @if (article()!.is_breaking) {
                  <span class="px-3 py-1 bg-red-600 text-white text-sm rounded animate-pulse">
                    SON DAKİKA
                  </span>
                }
                @if (article()!.is_trending) {
                  <span class="px-3 py-1 bg-orange-500 text-white text-sm rounded">
                    GÜNDEMDE
                  </span>
                }
                @if (article()!.visibility === 'premium') {
                  <span class="px-3 py-1 bg-yellow-500 text-white text-sm rounded">
                    PREMİUM
                  </span>
                }
              </div>

              <!-- Title -->
              <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                {{ article()!.title }}
              </h1>

              <!-- Subtitle -->
              @if (article()!.subtitle) {
                <p class="text-xl text-gray-600 mb-4">{{ article()!.subtitle }}</p>
              }

              <!-- Meta Info -->
              <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-b border-t py-4">
                <!-- Author -->
                <a [routerLink]="['/author', article()!.author?.slug]"
                   class="flex items-center gap-2 hover:text-blue-600">
                  <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span class="text-lg font-bold text-gray-600">
                      {{ article()!.author?.display_name?.charAt(0) }}
                    </span>
                  </div>
                  <div>
                    <div class="font-medium text-gray-800">{{ article()!.author?.display_name }}</div>
                    <div class="text-xs">{{ article()!.author?.title }}</div>
                  </div>
                </a>

                <span class="text-gray-300">|</span>

                <!-- Date -->
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span>{{ formatDate(article()!.published_at) }}</span>
                </div>

                <!-- Read Time -->
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>{{ article()!.read_time }} dk okuma</span>
                </div>

                <!-- Views -->
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <span>{{ article()!.views_count }} görüntülenme</span>
                </div>
              </div>
            </header>

            <!-- Featured Image -->
            @if (article()!.featured_image) {
              <figure class="mb-8">
                <img [src]="article()!.featured_image"
                     [alt]="article()!.title"
                     class="w-full h-auto rounded-lg shadow-lg">
              </figure>
            }

            <!-- Video Player -->
            @if (article()!.has_video && article()!.video_url) {
              <div class="mb-8 aspect-video bg-black rounded-lg overflow-hidden">
                <iframe [src]="article()!.video_url"
                        class="w-full h-full"
                        allowfullscreen>
                </iframe>
              </div>
            }

            <!-- Summary -->
            @if (article()!.summary) {
              <div class="bg-blue-50 border-l-4 border-blue-600 p-4 mb-8 rounded-r">
                <p class="text-lg text-gray-700 font-medium">{{ article()!.summary }}</p>
              </div>
            }

            <!-- Article Content -->
            <div class="prose prose-lg max-w-none mb-8"
                 [innerHTML]="article()!.content">
            </div>

            <!-- Tags -->
            @if (article()!.tags && article()!.tags.length > 0) {
              <div class="flex flex-wrap items-center gap-2 mb-8 pt-4 border-t">
                <span class="text-gray-600 font-medium">Etiketler:</span>
                @for (tag of article()!.tags; track tag.id) {
                  <a [routerLink]="['/tag', tag.slug]"
                     class="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors">
                    #{{ tag.name }}
                  </a>
                }
              </div>
            }

            <!-- Share & Actions -->
            <div class="flex flex-wrap items-center justify-between gap-4 py-4 border-t border-b mb-8">
              <!-- Share Buttons -->
              <div class="flex items-center gap-3">
                <span class="text-gray-600 font-medium">Paylaş:</span>
                <button (click)="shareOn('twitter')"
                        class="p-2 bg-[#1DA1F2] text-white rounded-full hover:opacity-80 transition-opacity">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </button>
                <button (click)="shareOn('facebook')"
                        class="p-2 bg-[#1877F2] text-white rounded-full hover:opacity-80 transition-opacity">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button (click)="shareOn('whatsapp')"
                        class="p-2 bg-[#25D366] text-white rounded-full hover:opacity-80 transition-opacity">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </button>
                <button (click)="copyLink()"
                        class="p-2 bg-gray-600 text-white rounded-full hover:opacity-80 transition-opacity">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                  </svg>
                </button>
              </div>

              <!-- Bookmark Button -->
              <button (click)="toggleBookmark()"
                      [class]="isBookmarked() ? 'text-yellow-500' : 'text-gray-400'"
                      class="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                <svg class="w-5 h-5" [attr.fill]="isBookmarked() ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                </svg>
                <span>{{ isBookmarked() ? 'Kaydedildi' : 'Kaydet' }}</span>
              </button>
            </div>

            <!-- Related Articles -->
            @if (relatedArticles().length > 0) {
              <section class="mb-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">İlgili Haberler</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  @for (related of relatedArticles(); track related.id) {
                    <a [routerLink]="['/articles', related.slug]"
                       class="group bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
                      <div class="h-32 bg-gray-200">
                        <img [src]="related.featured_image || 'https://via.placeholder.com/300x128'"
                             [alt]="related.title"
                             class="w-full h-full object-cover group-hover:scale-105 transition-transform">
                      </div>
                      <div class="p-3">
                        <h3 class="font-bold text-gray-800 group-hover:text-blue-600 line-clamp-2">
                          {{ related.title }}
                        </h3>
                        <span class="text-sm text-gray-500">{{ formatDate(related.published_at) }}</span>
                      </div>
                    </a>
                  }
                </div>
              </section>
            }

            <!-- Comments Section -->
            <section id="comments" class="bg-white rounded-lg shadow p-6">
              <h2 class="text-2xl font-bold text-gray-800 mb-6">
                Yorumlar ({{ comments().length }})
              </h2>

              <!-- Comment Form -->
              @if (authService.isAuthenticated()) {
                <form (submit)="submitComment($event)" class="mb-8">
                  <textarea [(ngModel)]="newComment"
                            name="comment"
                            rows="4"
                            class="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Yorumunuzu yazın..."
                            required></textarea>
                  <div class="flex justify-end mt-2">
                    <button type="submit"
                            [disabled]="submittingComment()"
                            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                      @if (submittingComment()) {
                        <span>Gönderiliyor...</span>
                      } @else {
                        <span>Yorum Yap</span>
                      }
                    </button>
                  </div>
                </form>
              } @else {
                <div class="bg-gray-50 rounded-lg p-4 mb-8 text-center">
                  <p class="text-gray-600 mb-2">Yorum yapabilmek için giriş yapmalısınız.</p>
                  <a routerLink="/auth/login" class="text-blue-600 hover:underline font-medium">Giriş Yap</a>
                </div>
              }

              <!-- Comments List -->
              @if (loadingComments()) {
                <div class="space-y-4">
                  @for (i of [1,2,3]; track i) {
                    <div class="flex gap-4 animate-pulse">
                      <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div class="flex-1 space-y-2">
                        <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  }
                </div>
              } @else if (comments().length === 0) {
                <div class="text-center py-8 text-gray-500">
                  <p>Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
                </div>
              } @else {
                <div class="space-y-6">
                  @for (comment of comments(); track comment.id) {
                    <div class="border-b pb-4 last:border-b-0">
                      <div class="flex gap-4">
                        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span class="text-blue-600 font-bold">
                            {{ (comment.user?.first_name || comment.name || 'A').charAt(0).toUpperCase() }}
                          </span>
                        </div>
                        <div class="flex-1">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="font-medium text-gray-800">
                              {{ comment.user?.first_name || comment.name || 'Anonim' }}
                            </span>
                            @if (comment.is_pinned) {
                              <span class="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">Sabitlendi</span>
                            }
                            <span class="text-sm text-gray-400">{{ formatDate(comment.created_at) }}</span>
                          </div>
                          <p class="text-gray-700">{{ comment.content }}</p>
                          <div class="flex items-center gap-4 mt-2">
                            <button (click)="likeComment(comment.id)"
                                    class="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
                              </svg>
                              <span>{{ comment.likes_count }}</span>
                            </button>
                            <button (click)="replyTo(comment)"
                                    class="text-sm text-gray-500 hover:text-blue-600">
                              Yanıtla
                            </button>
                          </div>

                          <!-- Replies -->
                          @if (comment.replies && comment.replies.length > 0) {
                            <div class="ml-8 mt-4 space-y-4">
                              @for (reply of comment.replies; track reply.id) {
                                <div class="flex gap-3 bg-gray-50 p-3 rounded">
                                  <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span class="text-gray-600 text-sm font-bold">
                                      {{ (reply.user?.first_name || reply.name || 'A').charAt(0).toUpperCase() }}
                                    </span>
                                  </div>
                                  <div class="flex-1">
                                    <div class="flex items-center gap-2 mb-1">
                                      <span class="font-medium text-sm text-gray-800">
                                        {{ reply.user?.first_name || reply.name || 'Anonim' }}
                                      </span>
                                      <span class="text-xs text-gray-400">{{ formatDate(reply.created_at) }}</span>
                                    </div>
                                    <p class="text-sm text-gray-700">{{ reply.content }}</p>
                                  </div>
                                </div>
                              }
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </section>
          </div>
        </article>
      }
    </div>
  `,
  styles: [`
    .prose {
      color: #374151;
      line-height: 1.75;
    }

    .prose h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-top: 2rem;
      margin-bottom: 1rem;
    }

    .prose h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
    }

    .prose p {
      margin-bottom: 1.25rem;
    }

    .prose ul, .prose ol {
      margin-bottom: 1.25rem;
      padding-left: 1.5rem;
    }

    .prose li {
      margin-bottom: 0.5rem;
    }

    .prose blockquote {
      border-left: 4px solid #3B82F6;
      padding-left: 1rem;
      font-style: italic;
      color: #6B7280;
      margin: 1.5rem 0;
    }

    .prose img {
      max-width: 100%;
      height: auto;
      border-radius: 0.5rem;
      margin: 1.5rem 0;
    }

    .prose a {
      color: #3B82F6;
      text-decoration: underline;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ArticleDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private articleService = inject(ArticleService);
  private commentService = inject(CommentService);
  private bookmarkService = inject(BookmarkService);
  authService = inject(AuthService);

  private destroy$ = new Subject<void>();

  // State
  loading = signal(true);
  error = signal<string | null>(null);
  article = signal<Article | null>(null);
  relatedArticles = signal<Article[]>([]);
  comments = signal<Comment[]>([]);
  loadingComments = signal(true);
  submittingComment = signal(false);
  isBookmarked = signal(false);

  newComment = '';
  replyingTo: Comment | null = null;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const slug = params.get('slug');
        if (slug) {
          this.loadArticle(slug);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadArticle(slug: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.articleService.getArticle(slug).subscribe({
      next: (article) => {
        this.article.set(article);
        this.loading.set(false);

        // Load related data
        this.loadRelatedArticles(slug);
        this.loadComments(slug);
        this.checkBookmarkStatus(article.id);

        // Increment view count
        this.articleService.incrementView(slug).subscribe();
      },
      error: (err) => {
        this.error.set('Haber yüklenirken bir hata oluştu.');
        this.loading.set(false);
        console.error('Error loading article:', err);
      }
    });
  }

  private loadRelatedArticles(slug: string): void {
    this.articleService.getRelatedArticles(slug, 3).subscribe({
      next: (articles) => this.relatedArticles.set(articles),
      error: (err) => console.error('Error loading related articles:', err)
    });
  }

  private loadComments(slug: string): void {
    this.loadingComments.set(true);

    this.commentService.getArticleComments(slug, { limit: 50 }).subscribe({
      next: (response) => {
        this.comments.set(response.results);
        this.loadingComments.set(false);
      },
      error: (err) => {
        console.error('Error loading comments:', err);
        this.loadingComments.set(false);
      }
    });
  }

  private checkBookmarkStatus(articleId: number): void {
    if (!this.authService.isAuthenticated()) return;

    this.bookmarkService.checkBookmark(articleId).subscribe({
      next: (response) => this.isBookmarked.set(response.is_bookmarked),
      error: () => this.isBookmarked.set(false)
    });
  }

  submitComment(event: Event): void {
    event.preventDefault();
    if (!this.newComment.trim() || !this.article()) return;

    this.submittingComment.set(true);

    const data = {
      article: this.article()!.id,
      content: this.newComment.trim(),
      parent: this.replyingTo?.id
    };

    this.commentService.createComment(data).subscribe({
      next: (comment) => {
        const current = this.comments();
        this.comments.set([comment, ...current]);
        this.newComment = '';
        this.replyingTo = null;
        this.submittingComment.set(false);
      },
      error: (err) => {
        console.error('Error creating comment:', err);
        this.submittingComment.set(false);
        alert('Yorum gönderilemedi. Lütfen tekrar deneyin.');
      }
    });
  }

  replyTo(comment: Comment): void {
    this.replyingTo = comment;
    this.newComment = `@${comment.user?.first_name || comment.name} `;
    document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' });
  }

  likeComment(commentId: number): void {
    if (!this.authService.isAuthenticated()) {
      alert('Beğenmek için giriş yapmalısınız.');
      return;
    }

    this.commentService.likeComment(commentId).subscribe({
      next: () => {
        const current = this.comments();
        const updated = current.map(c =>
          c.id === commentId ? { ...c, likes_count: c.likes_count + 1 } : c
        );
        this.comments.set(updated);
      },
      error: (err) => console.error('Error liking comment:', err)
    });
  }

  toggleBookmark(): void {
    if (!this.authService.isAuthenticated()) {
      alert('Kaydetmek için giriş yapmalısınız.');
      return;
    }

    if (!this.article()) return;

    if (this.isBookmarked()) {
      this.bookmarkService.removeBookmark(this.article()!.id).subscribe({
        next: () => this.isBookmarked.set(false),
        error: (err) => console.error('Error removing bookmark:', err)
      });
    } else {
      this.bookmarkService.addBookmark(this.article()!.id).subscribe({
        next: () => this.isBookmarked.set(true),
        error: (err) => console.error('Error adding bookmark:', err)
      });
    }
  }

  shareOn(platform: string): void {
    if (!this.article()) return;

    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(this.article()!.title);
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${title}%20${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  }

  copyLink(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Link kopyalandı!');
    });
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
