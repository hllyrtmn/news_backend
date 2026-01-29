/**
 * Category Mapper
 *
 * Transforms between API and domain models for categories
 */

import { Category, CategoryApiResponse, CategoryFormData } from '../models/category.types';

export class CategoryMapper {
  /**
   * Transform API response to domain model
   */
  static toDomain(apiData: CategoryApiResponse): Category {
    return {
      id: apiData.id,
      name: apiData.name,
      slug: apiData.slug,
      description: apiData.description,
      color: apiData.color,
      articleCount: apiData.article_count,
      createdAt: apiData.created_at ? new Date(apiData.created_at) : undefined,
      updatedAt: apiData.updated_at ? new Date(apiData.updated_at) : undefined,
    };
  }

  /**
   * Transform form data to API request
   */
  static toApiRequest(formData: CategoryFormData): Record<string, any> {
    return {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || '',
      color: formData.color || null,
    };
  }
}
