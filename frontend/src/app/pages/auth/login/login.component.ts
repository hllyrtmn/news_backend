import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { SocialAuthService } from '../../../core/auth/social-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private socialAuthService = inject(SocialAuthService);
  private router = inject(Router);

  loginForm!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  requires2FA = signal(false);
  showPassword = signal(false);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      twoFactorCode: ['']
    });

    // Initialize social auth
    this.socialAuthService.initGoogleAuth();
    this.socialAuthService.initFacebookAuth();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const credentials = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
      two_factor_code: this.loginForm.value.twoFactorCode || undefined
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        if (response.requires_2fa) {
          this.requires2FA.set(true);
          this.loading.set(false);
          this.loginForm.get('twoFactorCode')?.setValidators([Validators.required]);
          this.loginForm.get('twoFactorCode')?.updateValueAndValidity();
        } else {
          this.loading.set(false);
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message || 'Login failed. Please check your credentials.');
      }
    });
  }

  signInWithGoogle(): void {
    this.socialAuthService.signInWithGoogle();
  }

  signInWithFacebook(): void {
    this.loading.set(true);
    this.socialAuthService.signInWithFacebook().then(() => {
      this.loading.set(false);
      this.router.navigate(['/']);
    }).catch((error) => {
      this.loading.set(false);
      this.error.set('Facebook login failed');
      console.error(error);
    });
  }

  signInWithTwitter(): void {
    this.socialAuthService.signInWithTwitter();
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }
}
