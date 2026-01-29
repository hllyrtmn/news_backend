/**
 * Date Ago Pipe
 *
 * Transform date to relative time string (e.g., "2 saat önce")
 */

import { Pipe, PipeTransform } from '@angular/core';
import { DateUtils } from '../utils/date.utils';

@Pipe({
  name: 'dateAgo',
  standalone: true,
})
export class DateAgoPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }

    return DateUtils.dateAgo(value);
  }
}
