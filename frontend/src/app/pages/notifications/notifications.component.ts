import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold mb-4">Bildirimler</h1>
      <p>Bildirimler buraya gelecek...</p>
    </div>
  `,
  styles: []
})
export class NotificationsComponent {}
