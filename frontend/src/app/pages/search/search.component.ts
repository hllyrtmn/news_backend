import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold mb-4">Arama</h1>
      <p>Arama sonuçları buraya gelecek...</p>
    </div>
  `,
  styles: []
})
export class SearchComponent {}
