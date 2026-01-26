import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Interface for optimized image response
 */
export interface OptimizedImage {
  id: number;
  alt_text: string;
  width: number;
  height: number;
  src: string;
  webp_src?: string;
  srcset?: string;
  srcset_webp?: string;
  sizes?: string;
  placeholder?: string;
  dominant_color?: string;
  blurhash?: string;
}

/**
 * Interface for picture element response
 */
export interface PictureElement {
  sources: Array<{
    srcset: string;
    type: string;
    sizes: string;
  }>;
  img: {
    src: string;
    alt: string;
    width: number;
    height: number;
    loading: string;
    decoding: string;
    style?: string;
    'data-placeholder'?: string;
    'data-blurhash'?: string;
  };
}

/**
 * Interface for media item
 */
export interface MediaItem {
  id: number;
  title: string;
  alt_text: string;
  caption: string;
  file: string;
  file_type: 'image' | 'video' | 'audio' | 'document';
  mime_type: string;
  file_size: number;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail?: string;
  webp_file?: string;
  webp_thumbnail?: string;
  uploaded_by: number;
  copyright_holder: string;
  is_featured: boolean;
  created_at: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  is_optimized: boolean;
  is_image: boolean;
  srcset?: string;
  srcset_webp?: string;
  sizes?: string;
  placeholder?: string;
  dominant_color?: string;
  blurhash?: string;
  responsive_urls?: Record<string, string>;
  webp_responsive_urls?: Record<string, string>;
}

/**
 * Interface for media list response
 */
export interface MediaListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MediaItem[];
}

/**
 * Interface for media stats
 */
export interface MediaStats {
  total_images: number;
  optimized: number;
  pending: number;
  processing: number;
  failed: number;
  optimization_rate: string;
}

/**
 * MediaService
 *
 * Service for interacting with the media API including
 * image optimization features.
 */
@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/media`;

  /**
   * Get all media items with optional filters
   */
  getMediaList(params?: {
    file_type?: string;
    is_featured?: boolean;
    processing_status?: string;
    optimized?: boolean;
    page?: number;
    page_size?: number;
  }): Observable<MediaListResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    return this.http.get<MediaListResponse>(this.apiUrl + '/', { params: httpParams });
  }

  /**
   * Get a single media item by ID
   */
  getMedia(id: number): Observable<MediaItem> {
    return this.http.get<MediaItem>(`${this.apiUrl}/${id}/`);
  }

  /**
   * Get optimized image data for lazy loading
   */
  getOptimizedImage(id: number): Observable<OptimizedImage> {
    return this.http.get<OptimizedImage>(`${this.apiUrl}/${id}/optimized/`);
  }

  /**
   * Get picture element data for HTML <picture> tag
   */
  getPictureElement(id: number): Observable<PictureElement> {
    return this.http.get<PictureElement>(`${this.apiUrl}/${id}/picture/`);
  }

  /**
   * Upload a new media file
   */
  uploadMedia(file: File, data: {
    title: string;
    alt_text?: string;
    caption?: string;
    file_type: 'image' | 'video' | 'audio' | 'document';
    copyright_holder?: string;
  }): Observable<MediaItem> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', data.title);
    formData.append('file_type', data.file_type);

    if (data.alt_text) formData.append('alt_text', data.alt_text);
    if (data.caption) formData.append('caption', data.caption);
    if (data.copyright_holder) formData.append('copyright_holder', data.copyright_holder);

    return this.http.post<MediaItem>(this.apiUrl + '/', formData);
  }

  /**
   * Update media item
   */
  updateMedia(id: number, data: Partial<MediaItem>): Observable<MediaItem> {
    return this.http.patch<MediaItem>(`${this.apiUrl}/${id}/`, data);
  }

  /**
   * Delete media item
   */
  deleteMedia(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  /**
   * Reprocess an image (admin only)
   */
  reprocessImage(id: number, variants?: string[]): Observable<{
    message: string;
    media_id: number;
    status: string;
  }> {
    return this.http.post<any>(`${this.apiUrl}/${id}/reprocess/`, { variants });
  }

  /**
   * Batch reprocess images (admin only)
   */
  batchReprocess(params: {
    media_ids?: number[];
    reprocess_failed?: boolean;
    reprocess_pending?: boolean;
  }): Observable<{
    message: string;
    count: number;
    media_ids: number[];
  }> {
    return this.http.post<any>(`${this.apiUrl}/batch_reprocess/`, params);
  }

  /**
   * Get media optimization statistics
   */
  getStats(): Observable<MediaStats> {
    return this.http.get<MediaStats>(`${this.apiUrl}/stats/`);
  }

  /**
   * Check if browser supports WebP
   */
  supportsWebP(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }
}
