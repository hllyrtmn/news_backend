/**
 * Article Mapper
 *
 * Transform data between API and Domain models
 */

import {
  Article,
  ArticleApiResponse,
  ArticleFormData,
} from '../models/article.types';

export class ArticleMapper {
  /**
   * Transform API response to Domain model
   * @param apiData API response
   * @returns Domain model
   */
  static toDomain(apiData: ArticleApiResponse): Article {
    return {
      id: apiData.id,
      title: apiData.title,
      slug: apiData.slug,
      content: apiData.content,
      excerpt: apiData.excerpt || '',
      author: {
        id: apiData.author.id,
        name: apiData.author.full_name,
        avatar: apiData.author.profile_picture,
        bio: apiData.author.bio,
      },
      category: apiData.category
        ? {
            id: apiData.category.id,
            name: apiData.category.name,
            slug: apiData.category.slug,
            color: apiData.category.color,
            icon: apiData.category.icon,
          }
        : null,
      tags: apiData.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
      })),
      featuredImage: apiData.featured_image,
      status: apiData.status,
      viewsCount: apiData.views_count,
      likesCount: apiData.likes_count,
      commentsCount: apiData.comments_count,
      createdAt: new Date(apiData.created_at),
      updatedAt: new Date(apiData.updated_at),
      publishedAt: apiData.published_at ? new Date(apiData.published_at) : null,
      scheduledAt: apiData.scheduled_at ? new Date(apiData.scheduled_at) : null,
    };
  }

  /**
   * Transform Form data to API request
   * @param formData Form data
   * @returns API request object
   */
  static toApiRequest(formData: ArticleFormData): Record<string, any> {
    return {
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt || '',
      category: formData.categoryId,
      tags: formData.tagIds,
      featured_image: formData.featuredImageId,
      status: formData.status,
      scheduled_at: formData.scheduledAt,
    };
  }

  /**
   * Transform multiple API items to Domain models
   * @param apiList Array of API responses
   * @returns Array of Domain models
   */
  static toDomainList(apiList: ArticleApiResponse[]): Article[] {
    return apiList.map((item) => this.toDomain(item));
  }

  /**
   * Transform Article to Form data (for editing)
   * @param article Domain model
   * @returns Form data
   */
  static toFormData(article: Article): ArticleFormData {
    return {
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      categoryId: article.category?.id || null,
      tagIds: article.tags.map((tag) => tag.id),
      featuredImageId: article.featuredImage ? parseInt(article.featuredImage) : null,
      status: article.status,
      scheduledAt: article.scheduledAt ? article.scheduledAt.toISOString() : null,
    };
  }
}
