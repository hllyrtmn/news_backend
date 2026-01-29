/**
 * Settings Service
 *
 * Manages site settings with Signals + RxJS hybrid pattern
 */

import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, map } from 'rxjs';
import { HttpService } from '../../../core/services/http.service';
import { API_ENDPOINTS } from '../../../shared/constants/api.constants';
import { NotificationHelper } from '../../../shared/helpers/notification.helper';

export interface SiteSettings {
  // General
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  itemsPerPage: number;

  // SEO
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;

  // Social
  twitterUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;

  // Features
  enableComments: boolean;
  requireCommentModeration: boolean;
  enableNewsletter: boolean;
  maintenanceMode: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly http = inject(HttpService);

  /**
   * Load site settings
   */
  loadSettings(): Observable<SiteSettings | null> {
    return this.http.get<any>(API_ENDPOINTS.settings.get).pipe(
      map(response => this.mapToSettings(response)),
      catchError(error => {
        console.error('Failed to load settings:', error);
        NotificationHelper.showError('Ayarlar yüklenemedi');

        // Return mock settings for development
        const mockSettings: SiteSettings = {
          siteName: 'Haber Sitesi',
          siteDescription: 'Güncel haberler ve teknoloji yazıları',
          contactEmail: 'iletisim@example.com',
          itemsPerPage: 20,
          metaTitle: 'Haber Sitesi - Güncel Haberler',
          metaDescription: 'En güncel haberler ve teknoloji haberleri burada',
          metaKeywords: 'haber, teknoloji, yazılım, angular',
          twitterUrl: 'https://twitter.com/example',
          facebookUrl: 'https://facebook.com/example',
          instagramUrl: 'https://instagram.com/example',
          linkedinUrl: 'https://linkedin.com/company/example',
          enableComments: true,
          requireCommentModeration: true,
          enableNewsletter: false,
          maintenanceMode: false,
        };
        return of(mockSettings);
      })
    );
  }

  /**
   * Update site settings
   */
  updateSettings(settings: SiteSettings): Observable<boolean> {
    const apiData = this.mapToApiFormat(settings);

    return this.http.put(API_ENDPOINTS.settings.get, apiData).pipe(
      map(() => {
        NotificationHelper.showSuccess('Ayarlar başarıyla güncellendi');
        return true;
      }),
      catchError(error => {
        console.error('Failed to update settings:', error);
        NotificationHelper.showError('Ayarlar güncellenemedi');
        return of(false);
      })
    );
  }

  /**
   * Map API response to settings
   */
  private mapToSettings(apiData: any): SiteSettings {
    return {
      siteName: apiData.site_name || '',
      siteDescription: apiData.site_description || '',
      contactEmail: apiData.contact_email || '',
      itemsPerPage: apiData.items_per_page || 20,
      metaTitle: apiData.meta_title || '',
      metaDescription: apiData.meta_description || '',
      metaKeywords: apiData.meta_keywords || '',
      twitterUrl: apiData.twitter_url || '',
      facebookUrl: apiData.facebook_url || '',
      instagramUrl: apiData.instagram_url || '',
      linkedinUrl: apiData.linkedin_url || '',
      enableComments: apiData.enable_comments ?? true,
      requireCommentModeration: apiData.require_comment_moderation ?? true,
      enableNewsletter: apiData.enable_newsletter ?? false,
      maintenanceMode: apiData.maintenance_mode ?? false,
    };
  }

  /**
   * Map settings to API format
   */
  private mapToApiFormat(settings: SiteSettings): Record<string, any> {
    return {
      site_name: settings.siteName,
      site_description: settings.siteDescription,
      contact_email: settings.contactEmail,
      items_per_page: settings.itemsPerPage,
      meta_title: settings.metaTitle,
      meta_description: settings.metaDescription,
      meta_keywords: settings.metaKeywords,
      twitter_url: settings.twitterUrl,
      facebook_url: settings.facebookUrl,
      instagram_url: settings.instagramUrl,
      linkedin_url: settings.linkedinUrl,
      enable_comments: settings.enableComments,
      require_comment_moderation: settings.requireCommentModeration,
      enable_newsletter: settings.enableNewsletter,
      maintenance_mode: settings.maintenanceMode,
    };
  }
}
