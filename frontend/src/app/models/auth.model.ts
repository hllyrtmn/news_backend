// Authentication models

import { User } from './user.model';

export interface LoginRequest {
  username: string;
  password: string;
  totp_code?: string; // For 2FA
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
  requires_2fa?: boolean;
}

export interface RegisterRequest {
  email: string;
  password1: string;
  password2: string;
  first_name?: string;
  last_name?: string;
  user_type?: string;
}

export interface RegisterResponse {
  access: string;
  refresh: string;
  user: User;
  message: string;
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
  refresh: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  uid: string;
  token: string;
  new_password1: string;
  new_password2: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password2: string;
}

// 2FA Models
export interface TwoFactorSetupResponse {
  secret: string;
  qr_code: string; // Base64 image
  backup_codes: string[];
  message: string;
}

export interface TwoFactorVerifyRequest {
  code: string;
}

export interface TwoFactorVerifyResponse {
  message: string;
  two_factor_enabled: boolean;
}

export interface TwoFactorDisableRequest {
  password: string;
  code: string;
}

export interface TwoFactorStatusResponse {
  two_factor_enabled: boolean;
  backup_codes_remaining: number;
}

// Social Auth Models
export interface SocialAuthProvider {
  name: string;
  display_name: string;
  login_url: string;
  icon: string;
}

export interface SocialAuthCallback {
  provider: string;
  code: string;
  state: string;
}
