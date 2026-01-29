/**
 * Comment Mapper
 *
 * Transforms between API and domain models for comments
 */

import { Comment, CommentApiResponse } from '../models/comment.types';

export class CommentMapper {
  /**
   * Transform API response to domain model
   */
  static toDomain(apiData: CommentApiResponse): Comment {
    return {
      id: apiData.id,
      content: apiData.content,
      author: {
        id: apiData.author.id,
        username: apiData.author.username,
        fullName: apiData.author.full_name,
        avatar: apiData.author.avatar,
      },
      article: {
        id: apiData.article.id,
        title: apiData.article.title,
        slug: apiData.article.slug,
      },
      status: apiData.status,
      createdAt: new Date(apiData.created_at),
      updatedAt: new Date(apiData.updated_at),
      moderatedBy: apiData.moderated_by ? {
        id: apiData.moderated_by.id,
        username: apiData.moderated_by.username,
        fullName: apiData.moderated_by.full_name,
      } : undefined,
      moderatedAt: apiData.moderated_at ? new Date(apiData.moderated_at) : undefined,
      moderationNote: apiData.moderation_note,
    };
  }
}
