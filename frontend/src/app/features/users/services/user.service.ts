/**
 * User Service
 *
 * Manages users with Signals + RxJS hybrid pattern
 */

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, tap, map } from 'rxjs';
import { HttpService } from '../../../core/services/http.service';
import { API_ENDPOINTS } from '../../../shared/constants/api.constants';
import { User, UserApiResponse, UserFormData } from '../../../shared/models/user.types';
import { UserMapper } from '../../../shared/mappers/user.mapper';
import { NotificationHelper } from '../../../shared/helpers/notification.helper';

interface UserListParams {
  page?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpService);

  // Private RxJS Subjects
  private readonly usersSubject = new BehaviorSubject<User[]>([]);
  private readonly totalCountSubject = new BehaviorSubject<number>(0);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  // Public Observables
  readonly users$: Observable<User[]> = this.usersSubject.asObservable();
  readonly totalCount$: Observable<number> = this.totalCountSubject.asObservable();
  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();
  readonly error$: Observable<string | null> = this.errorSubject.asObservable();

  /**
   * Load users list with filters and pagination
   */
  loadUsers(params: UserListParams = {}): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const queryParams: Record<string, any> = {
      page: params.page || 1,
      page_size: 20,
    };

    if (params.search) queryParams.search = params.search;
    if (params.role) queryParams.role = params.role;
    if (params.isActive !== undefined) queryParams.is_active = params.isActive;
    if (params.sort) queryParams.ordering = params.order === 'desc' ? `-${params.sort}` : params.sort;

    this.http
      .get<{ results: UserApiResponse[]; count: number }>(
        API_ENDPOINTS.users.list,
        queryParams
      )
      .pipe(
        tap(response => {
          const users = response.results.map(item => UserMapper.toDomain(item));
          this.usersSubject.next(users);
          this.totalCountSubject.next(response.count);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('Failed to load users:', error);
          this.errorSubject.next('Kullanıcılar yüklenemedi');
          this.loadingSubject.next(false);
          NotificationHelper.showError('Kullanıcılar yüklenemedi');

          // Mock data for development
          const mockUsers: User[] = [
            {
              id: 1,
              username: 'admin',
              email: 'admin@example.com',
              fullName: 'Admin User',
              firstName: 'Admin',
              lastName: 'User',
              role: 'admin',
              isActive: true,
              isStaff: true,
              isSuperuser: true,
              dateJoined: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365),
              lastLogin: new Date(Date.now() - 1000 * 60 * 30),
            },
            {
              id: 2,
              username: 'editor1',
              email: 'editor@example.com',
              fullName: 'Ayşe Kaya',
              firstName: 'Ayşe',
              lastName: 'Kaya',
              role: 'editor',
              isActive: true,
              isStaff: true,
              isSuperuser: false,
              dateJoined: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180),
              lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2),
            },
            {
              id: 3,
              username: 'author1',
              email: 'author@example.com',
              fullName: 'Mehmet Demir',
              firstName: 'Mehmet',
              lastName: 'Demir',
              role: 'author',
              isActive: true,
              isStaff: false,
              isSuperuser: false,
              dateJoined: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
              lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24),
            },
            {
              id: 4,
              username: 'user1',
              email: 'user@example.com',
              fullName: 'Fatma Şahin',
              firstName: 'Fatma',
              lastName: 'Şahin',
              role: 'user',
              isActive: false,
              isStaff: false,
              isSuperuser: false,
              dateJoined: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
              lastLogin: null,
            },
          ];
          this.usersSubject.next(mockUsers);
          this.totalCountSubject.next(mockUsers.length);
          return of({ results: [], count: 0 });
        })
      )
      .subscribe();
  }

  /**
   * Get single user by ID
   */
  getUser(id: number): Observable<User | null> {
    return this.http.get<UserApiResponse>(API_ENDPOINTS.users.detail(id)).pipe(
      map(response => UserMapper.toDomain(response)),
      catchError(error => {
        console.error('Failed to load user:', error);
        NotificationHelper.showError('Kullanıcı yüklenemedi');
        return of(null);
      })
    );
  }

  /**
   * Create new user
   */
  createUser(formData: UserFormData): Observable<User | null> {
    const apiData = UserMapper.toApiRequest(formData);

    return this.http.post<UserApiResponse>(API_ENDPOINTS.users.create, apiData).pipe(
      map(response => {
        const user = UserMapper.toDomain(response);
        NotificationHelper.showSuccess('Kullanıcı başarıyla oluşturuldu');
        return user;
      }),
      catchError(error => {
        console.error('Failed to create user:', error);
        NotificationHelper.showError('Kullanıcı oluşturulamadı');
        return of(null);
      })
    );
  }

  /**
   * Update existing user
   */
  updateUser(id: number, formData: UserFormData): Observable<User | null> {
    const apiData = UserMapper.toApiRequest(formData);

    return this.http.put<UserApiResponse>(API_ENDPOINTS.users.update(id), apiData).pipe(
      map(response => {
        const user = UserMapper.toDomain(response);
        NotificationHelper.showSuccess('Kullanıcı başarıyla güncellendi');
        return user;
      }),
      catchError(error => {
        console.error('Failed to update user:', error);
        NotificationHelper.showError('Kullanıcı güncellenemedi');
        return of(null);
      })
    );
  }

  /**
   * Delete user
   */
  deleteUser(id: number): Observable<boolean> {
    return this.http.delete(API_ENDPOINTS.users.delete(id)).pipe(
      map(() => {
        NotificationHelper.showSuccess('Kullanıcı başarıyla silindi');
        return true;
      }),
      catchError(error => {
        console.error('Failed to delete user:', error);
        NotificationHelper.showError('Kullanıcı silinemedi');
        return of(false);
      })
    );
  }

  /**
   * Toggle user active status
   */
  toggleUserStatus(id: number, isActive: boolean): Observable<boolean> {
    return this.http.post(API_ENDPOINTS.users.toggleActive(id), { is_active: isActive }).pipe(
      map(() => {
        NotificationHelper.showSuccess(
          isActive ? 'Kullanıcı aktif edildi' : 'Kullanıcı pasif edildi'
        );
        return true;
      }),
      catchError(error => {
        console.error('Failed to toggle user status:', error);
        NotificationHelper.showError('Kullanıcı durumu değiştirilemedi');
        return of(false);
      })
    );
  }

  /**
   * Get user activity history
   */
  getUserActivity(id: number): Observable<any[]> {
    return this.http.get<any[]>(API_ENDPOINTS.users.activity(id)).pipe(
      catchError(error => {
        console.error('Failed to load user activity:', error);
        return of([]);
      })
    );
  }

  /**
   * Refresh users list
   */
  refresh(): void {
    this.loadUsers();
  }
}
