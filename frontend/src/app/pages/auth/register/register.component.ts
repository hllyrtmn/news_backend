import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      password1: ['', [Validators.required, Validators.minLength(8)]],
      password2: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password1 = control.get('password1');
    const password2 = control.get('password2');

    if (!password1 || !password2) {
      return null;
    }

    return password1.value === password2.value ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // Tüm form değerlerini doğrudan gönder (backend formatıyla uyumlu)
    const registerData = this.registerForm.value;

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.success.set(true);
        // Show success message for 3 seconds, then redirect to login
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.originalError?.error) {
          const errors = err.originalError.error;
          if (errors.email) {
            this.error.set(`Email: ${errors.email[0]}`);
          } else if (errors.username) {
            this.error.set(`Kullanıcı Adı: ${errors.username[0]}`);
          } else {
            this.error.set(err.message || 'Kayıt başarısız. Lütfen tekrar deneyin.');
          }
        } else {
          this.error.set(err.message || 'Kayıt başarısız. Lütfen tekrar deneyin.');
        }
      }
    });
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  get passwordMismatch(): boolean {
    return this.registerForm.hasError('passwordMismatch') &&
           this.registerForm.get('password2')?.touched || false;
  }
}
