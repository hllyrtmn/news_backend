/**
 * Table Component (Dumb)
 *
 * Reusable data table with sorting, selection, and loading states
 */

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableSort {
  key: string;
  order: 'asc' | 'desc';
}

@Component({
  selector: 'app-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <!-- Header -->
        <thead class="bg-gray-50">
          <tr>
            @if (selectable) {
              <th class="px-6 py-3 w-12">
                <input
                  type="checkbox"
                  [checked]="allSelected"
                  [indeterminate]="someSelected"
                  (change)="onSelectAll()"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
            }
            @for (column of columns; track column.key) {
              <th
                [class]="getHeaderClasses(column)"
                [style.width]="column.width || 'auto'"
              >
                @if (column.sortable) {
                  <button
                    (click)="onSort(column.key as string)"
                    class="group inline-flex items-center space-x-1 hover:text-gray-900"
                  >
                    <span>{{ column.label }}</span>
                    <span class="ml-2 flex-none rounded text-gray-400 group-hover:text-gray-900">
                      @if (sort?.key === column.key) {
                        @if (sort.order === 'asc') {
                          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" />
                          </svg>
                        } @else {
                          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" />
                          </svg>
                        }
                      } @else {
                        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                        </svg>
                      }
                    </span>
                  </button>
                } @else {
                  {{ column.label }}
                }
              </th>
            }
            @if (hasActions) {
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            }
          </tr>
        </thead>

        <!-- Body -->
        <tbody class="bg-white divide-y divide-gray-200">
          @if (loading) {
            <tr>
              <td [attr.colspan]="columnCount" class="px-6 py-12 text-center">
                <div class="flex justify-center">
                  <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </td>
            </tr>
          } @else if (data.length === 0) {
            <tr>
              <td [attr.colspan]="columnCount" class="px-6 py-12 text-center text-gray-500">
                {{ emptyText }}
              </td>
            </tr>
          } @else {
            @for (row of data; track trackBy($index, row)) {
              <tr [class]="getRowClasses(row)" (click)="onRowClick(row)">
                @if (selectable) {
                  <td class="px-6 py-4 w-12">
                    <input
                      type="checkbox"
                      [checked]="isSelected(row)"
                      (change)="onSelectRow(row)"
                      (click)="$event.stopPropagation()"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                }
                @for (column of columns; track column.key) {
                  <td [class]="getCellClasses(column)">
                    <ng-content [select]="'[column-' + column.key + ']'"></ng-content>
                  </td>
                }
                @if (hasActions) {
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <ng-content select="[actions]"></ng-content>
                  </td>
                }
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `,
})
export class TableComponent<T = any> {
  @Input() columns: TableColumn<T>[] = [];
  @Input() data: T[] = [];
  @Input() loading: boolean = false;
  @Input() selectable: boolean = false;
  @Input() selectedRows: T[] = [];
  @Input() hasActions: boolean = false;
  @Input() sort: TableSort | null = null;
  @Input() emptyText: string = 'Veri bulunamadı';
  @Input() hoverable: boolean = true;
  @Input() trackByFn?: (index: number, item: T) => any;

  @Output() sortChange = new EventEmitter<TableSort>();
  @Output() selectChange = new EventEmitter<T[]>();
  @Output() rowClick = new EventEmitter<T>();

  get columnCount(): number {
    let count = this.columns.length;
    if (this.selectable) count++;
    if (this.hasActions) count++;
    return count;
  }

  get allSelected(): boolean {
    return this.data.length > 0 && this.selectedRows.length === this.data.length;
  }

  get someSelected(): boolean {
    return this.selectedRows.length > 0 && this.selectedRows.length < this.data.length;
  }

  getHeaderClasses(column: TableColumn<T>): string {
    const base = 'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider';
    const align = column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left';
    return `${base} ${align}`;
  }

  getCellClasses(column: TableColumn<T>): string {
    const base = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
    const align = column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left';
    return `${base} ${align}`;
  }

  getRowClasses(row: T): string {
    const base = this.hoverable ? 'hover:bg-gray-50 cursor-pointer transition-colors' : '';
    const selected = this.isSelected(row) ? 'bg-blue-50' : '';
    return `${base} ${selected}`.trim();
  }

  trackBy(index: number, item: T): any {
    return this.trackByFn ? this.trackByFn(index, item) : index;
  }

  isSelected(row: T): boolean {
    return this.selectedRows.includes(row);
  }

  onSort(key: string): void {
    const newOrder = this.sort?.key === key && this.sort?.order === 'asc' ? 'desc' : 'asc';
    this.sortChange.emit({ key, order: newOrder });
  }

  onSelectAll(): void {
    const newSelection = this.allSelected ? [] : [...this.data];
    this.selectChange.emit(newSelection);
  }

  onSelectRow(row: T): void {
    const newSelection = this.isSelected(row)
      ? this.selectedRows.filter(r => r !== row)
      : [...this.selectedRows, row];
    this.selectChange.emit(newSelection);
  }

  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }
}
