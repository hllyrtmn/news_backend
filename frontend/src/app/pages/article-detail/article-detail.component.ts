import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold mb-4">Haber Detayı</h1>
      <p>Haber detay içeriği buraya gelecek...</p>
    </div>
  `,
  styles: []
})
export class ArticleDetailComponent {}
