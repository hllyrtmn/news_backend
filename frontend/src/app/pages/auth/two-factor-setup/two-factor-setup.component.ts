import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TwoFactorService } from '../../../core/auth/two-factor.service';
import { TwoFactorSetupResponse } from '../../../models/auth.model';

@Component({
  selector: 'app-two-factor-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './two-factor-setup.component.html',
  styleUrls: ['./two-factor-setup.component.css']
})
export class TwoFactorSetupComponent implements OnInit {
  private fb = inject(FormBuilder);
  private twoFactorService = inject(TwoFactorService);
  private router = inject(Router);

  verifyForm: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  setupData = signal<TwoFactorSetupResponse | null>(null);
  currentStep = signal<'setup' | 'verify' | 'backup' | 'complete'>('setup');
  backupCodesCopied = signal(false);

  ngOnInit(): void {
    this.verifyForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    this.loadSetupData();
  }

  loadSetupData(): void {
    this.loading.set(true);
    this.twoFactorService.setup2FA().subscribe({
      next: (data) => {
        this.setupData.set(data);
        this.loading.set(false);
        this.currentStep.set('verify');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message || '2FA kurulumu başlatılamadı');
      }
    });
  }

  onVerify(): void {
    if (this.verifyForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const code = this.verifyForm.value.code;

    this.twoFactorService.verify2FA(code).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          this.currentStep.set('backup');
        } else {
          this.error.set('Geçersiz kod. Lütfen tekrar deneyin.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message || 'Doğrulama başarısız');
      }
    });
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard');
    });
  }

  copyBackupCodes(): void {
    const codes = this.setupData()?.backup_codes?.join('\n') || '';
    navigator.clipboard.writeText(codes).then(() => {
      this.backupCodesCopied.set(true);
    });
  }

  finish(): void {
    this.currentStep.set('complete');
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 2000);
  }

  get qrCodeData(): string {
    return this.setupData()?.qr_code || '';
  }

  get secretKey(): string {
    return this.setupData()?.secret || '';
  }

  get backupCodes(): string[] {
    return this.setupData()?.backup_codes || [];
  }
}
