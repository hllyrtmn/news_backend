/**
 * Highlight Pipe
 *
 * Highlight search term in text
 */

import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { StringUtils } from '../utils/string.utils';

@Pipe({
  name: 'highlight',
  standalone: true,
})
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(
    value: string | null | undefined,
    searchTerm: string | null | undefined,
    highlightClass: string = 'bg-yellow-200'
  ): SafeHtml {
    if (!value || !searchTerm) {
      return value || '';
    }

    const highlighted = StringUtils.highlight(value, searchTerm, highlightClass);
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}
