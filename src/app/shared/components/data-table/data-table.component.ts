import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@angular/core';

import { StatusBadgeComponent } from '../status-badge/status-badge.component';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';

  /**
   * Optional value formatter for display-only values.
   * Keeps the original row data unchanged.
   */
  value?: (row: any) => any;

type?:
  | 'text'
  | 'student-name'
  | 'status'
  | 'fee-status'
  | 'percentage'
  | 'current'
  | 'sections'
  | 'permissions'
  | 'permission-count'
  | 'date-time'
  | 'assignment-status'
  | 'attendance-teacher'
  | 'attendance-last-updated';
}

export interface TableAction {
  label: string;
  type: string;
  danger?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    StatusBadgeComponent
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent {

  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;

  @Input() actions: TableAction[] = [];

  @Input() rowActions?: (row: any) => TableAction[];

@Input() showActions = false;

/**
 * Keeps the first data column visible while
 * horizontally scrolling the table.
 */
@Input() stickyFirstColumn = false;

@Input() currentField?: string;

  @Input() enablePagination = false;
  @Input() pageSize = 10;

  @Output() actionClick = new EventEmitter<any>();

  @Output() studentNameClick = new EventEmitter<number>();


  /* =========================================================
     PAGINATION
     ========================================================= */

  currentPage = 1;

  get totalItems(): number {
    return this.data.length;
  }

  get totalPages(): number {

    if (!this.enablePagination || this.totalItems === 0) {
      return 1;
    }

    return Math.ceil(
      this.totalItems / this.pageSize
    );
  }

  get displayedData(): any[] {

    if (!this.enablePagination) {
      return this.data;
    }

    const startIndex =
      (this.currentPage - 1) * this.pageSize;

    return this.data.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  get displayStart(): number {

    if (this.totalItems === 0) {
      return 0;
    }

    return (this.currentPage - 1) *
      this.pageSize + 1;
  }

  get displayEnd(): number {

    if (this.totalItems === 0) {
      return 0;
    }

    if (!this.enablePagination) {
      return this.totalItems;
    }

    return Math.min(
      this.currentPage * this.pageSize,
      this.totalItems
    );
  }

  get pageNumbers(): number[] {

    return Array.from(
      { length: this.totalPages },
      (_, index) => index + 1
    );
  }

  goToPage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }

    this.currentPage = page;
    this.closeActionMenu();
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }


  /* =========================================================
     CELL HELPERS
     ========================================================= */

getCellValue(
  row: any,
  column: TableColumn
): any {

  if (column.value) {
    return column.value(row);
  }

  return row[column.key];
}
  getBooleanCellValue(
    row: any,
    column: TableColumn
  ): boolean {
    return Boolean(row[column.key]);
  }


  /* =========================================================
     STATUS
     ========================================================= */

  getStatusLabel(
    row: any,
    column: TableColumn
  ): string {

    const value = row[column.key];

    if (typeof value === 'boolean') {
      return value ? 'Active' : 'Inactive';
    }

    switch (value) {

      case 'DRAFT':
        return 'Draft';

      case 'PUBLISHED':
        return 'Published';

      case 'CLOSED':
        return 'Closed';

      default:
        return value ?? '';
    }
  }

  getStatusVariant(
    row: any,
    column: TableColumn
  ): 'success' | 'danger' | 'warning' {

    const value = row[column.key];

    if (typeof value === 'boolean') {
      return value ? 'success' : 'danger';
    }

    switch (value) {

      case 'PUBLISHED':
      case 'PRESENT':
        return 'success';

      case 'CLOSED':
      case 'ABSENT':
        return 'danger';

      case 'DRAFT':
        return 'warning';

      default:
        return 'warning';
    }
  }


  /* =========================================================
     DATE
     ========================================================= */

  formatDateTime(
    value: string | null | undefined
  ): string {

    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }
    ).format(date);
  }


  /* =========================================================
     CURRENT
     ========================================================= */

  isCurrent(row: any): boolean {

    return this.currentField
      ? Boolean(row[this.currentField])
      : false;
  }


  /* =========================================================
     ACTION MENU
     ========================================================= */

  openActionRowId: any = null;

  actionMenuTop = 0;
  actionMenuLeft = 0;

  actionMenuActions: TableAction[] = [];

  toggleActionMenu(
    row: any,
    index: number,
    event: MouseEvent
  ): void {

    event.stopPropagation();

    const rowId =
      this.getRowId(row, index);

    if (this.openActionRowId === rowId) {
      this.closeActionMenu();
      return;
    }

    const trigger =
      event.currentTarget as HTMLElement;

    const rect =
      trigger.getBoundingClientRect();

    const actions =
      this.getRowActions(row);

    const menuWidth = 160;
    const itemHeight = 38;
    const menuPadding = 10;

    const menuHeight =
      actions.length * itemHeight +
      menuPadding;

    const viewportPadding = 10;

    const spaceBelow =
      window.innerHeight - rect.bottom;

    const shouldOpenAbove =
      spaceBelow < menuHeight &&
      rect.top > menuHeight;

    let top = shouldOpenAbove
      ? rect.top - menuHeight - 6
      : rect.bottom + 6;

    let left =
      rect.right - menuWidth;

    /*
     * Keep menu inside viewport.
     */
    left = Math.max(
      viewportPadding,
      Math.min(
        left,
        window.innerWidth -
          menuWidth -
          viewportPadding
      )
    );

    top = Math.max(
      viewportPadding,
      Math.min(
        top,
        window.innerHeight -
          menuHeight -
          viewportPadding
      )
    );

    this.actionMenuTop = top;
    this.actionMenuLeft = left;

    this.actionMenuActions = actions;
    this.openActionRowId = rowId;
  }

  closeActionMenu(): void {

    this.openActionRowId = null;
    this.actionMenuActions = [];
  }

  onActionMenuClick(
    action: TableAction,
    row: any
  ): void {

    this.closeActionMenu();

    this.actionClick.emit({
      action,
      row
    });
  }

  onActionClick(
  action: TableAction,
  row: any
): void {

  this.actionClick.emit({
    action,
    row
  });
}
  @HostListener('window:resize')
  handleWindowResize(): void {

    if (this.openActionRowId !== null) {
      this.closeActionMenu();
    }
  }

  @HostListener('document:click')
  handleDocumentClick(): void {
    this.closeActionMenu();
  }


  /* =========================================================
     ACTION HELPERS
     ========================================================= */

  getRowActions(row: any): TableAction[] {

    return this.rowActions
      ? this.rowActions(row)
      : this.actions;
  }

  getRowId(
    row: any,
    index: number
  ): any {

    return row?.id ?? index;
  }


  /* =========================================================
     TRACKING
     ========================================================= */

  trackColumn(
    index: number,
    column: TableColumn
  ): string {
    return column.key;
  }

  trackRow(
    index: number,
    row: any
  ): any {
    return row?.id ?? index;
  }

  trackAction(
    index: number,
    action: TableAction
  ): string {
    return action.type;
  }

  trackItem(
    index: number,
    item: any
  ): any {
    return item?.id ?? index;
  }

  onStudentNameClick(row: any, event: MouseEvent): void {
  event.stopPropagation();

  const studentId = Number(row?.['id']);

  if (!Number.isFinite(studentId) || studentId <= 0) {
    return;
  }

  this.studentNameClick.emit(studentId);
}



}