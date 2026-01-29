/**
 * Truncate Pipe
 *
 * Truncate text to specified length
 */

import { Pipe, PipeTransform } from '@angular/core';
import { StringUtils } from '../utils/string.utils';

@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    length: number = 100,
    suffix: string = '...'
  ): string {
    if (!value) {
      return '';
    }

    return StringUtils.truncate(value, length, suffix);
  }
}
