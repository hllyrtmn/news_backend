/**
 * Lazy Load Directive
 *
 * Lazy load images using Intersection Observer
 */

import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true,
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Input('appLazyLoad') targetSrc: string = '';
  @Input() placeholder: string = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';

  private observer: IntersectionObserver | null = null;

  constructor(private el: ElementRef<HTMLImageElement>) {}

  ngOnInit() {
    // Set placeholder initially
    if (this.placeholder) {
      this.el.nativeElement.src = this.placeholder;
    }

    // Create intersection observer
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadImage();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before element is visible
      }
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private loadImage() {
    const img = this.el.nativeElement;

    if (this.targetSrc) {
      // Create a temporary image to preload
      const tempImg = new Image();

      tempImg.onload = () => {
        img.src = this.targetSrc;
        img.classList.add('loaded');
      };

      tempImg.onerror = () => {
        console.error(`Failed to load image: ${this.targetSrc}`);
        img.classList.add('error');
      };

      tempImg.src = this.targetSrc;
    }

    // Stop observing once loaded
    if (this.observer) {
      this.observer.unobserve(img);
    }
  }
}
