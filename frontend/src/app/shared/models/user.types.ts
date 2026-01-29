/**
 * User Type Definitions
 */

import { UserRole } from '../constants/app.constants';

// Domain Model (Frontend)
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  avatar: string | null;
  bio: string | null;
  role: UserRole;
  isActive: boolean;
  isStaff: boolean;
  isSuperuser: boolean;
  dateJoined: Date;
  lastLogin: Date | null;
}

// API Response Model
export interface UserApiResponse {
  id: number;
  username: string;
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  profile_picture: string | null;
  bio: string | null;
  role: UserRole;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string | null;
}

// Form Data Model
export interface UserFormData {
  username: string;
  email: string;
  password?: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  role: UserRole;
  isActive: boolean;
}

// Filters
export interface UserFilters {
  role?: UserRole | 'all';
  isActive?: boolean;
  search?: string;
  orderBy?: 'username' | 'email' | 'date_joined';
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Login
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: UserApiResponse;
}

export interface TokenRefreshResponse {
  access: string;
}
