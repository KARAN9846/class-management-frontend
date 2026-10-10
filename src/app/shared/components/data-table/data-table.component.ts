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
  sortable?: boolean;

  /**
   * Optional value formatter for display-only values.
   * Keeps the original row data unchanged.
   */
  value?: (row: any) => any;

  /**
   * Optional raw value used only for sorting.
   * Useful when display values are formatted strings.
   */
  sortValue?: (row: any) => any;

  type?:
    | 'text'
    | 'student-name'
    | 'teacher-name'
    | 'assignment-identity'
    | 'attendance-student'
    | 'school-identity'
    | 'subject-identity'
    | 'academic-year-identity'
    | 'fee-structure-identity'
    | 'fee-amount'
    | 'branch-identity'
    | 'board-medium-identity'
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
    | 'attendance-last-updated'
    | 'resource-bars';
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
  @Input() enableSelection = false;
  @Input() selectedRowIds: number[] = [];

  /**
   * Keeps the first data column visible while
   * horizontally scrolling the table.
   */
  @Input() stickyFirstColumn = false;

  @Input() currentField?: string;

  @Input() enablePagination = false;
  @Input() pageSize = 50;
  @Input() serverSideSorting = false;

  /**
   * Kept for backward compatibility with existing
   * DataTable consumers.
   *
   * Search is handled by individual table pages.
   */
  @Input() enableSearch = false;
  @Input() searchPlaceholder = 'Search...';

  @Output() actionClick = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<number[]>();
  @Output() sortChange = new EventEmitter<{
    sortBy: string | null;
    sortDirection: 'asc' | 'desc' | null;
  }>();

  @Output() studentNameClick = new EventEmitter<number>();

  isRowSelected(row: any): boolean {
  return this.selectedRowIds.includes(row.id);
}

toggleRowSelection(row: any): void {
  if (!row?.id) {
    return;
  }

  const selected = new Set(this.selectedRowIds);

  if (selected.has(row.id)) {
    selected.delete(row.id);
  } else {
    selected.add(row.id);
  }

  this.selectionChange.emit(Array.from(selected));
}

isAllDisplayedRowsSelected(): boolean {
  if (!this.displayedData.length) {
    return false;
  }

  return this.displayedData.every(row =>
    this.selectedRowIds.includes(row.id)
  );
}

toggleSelectAllDisplayedRows(): void {
  const selected = new Set(this.selectedRowIds);

  if (this.isAllDisplayedRowsSelected()) {
    this.displayedData.forEach(row => selected.delete(row.id));
  } else {
    this.displayedData.forEach(row => {
      if (row?.id) {
        selected.add(row.id);
      }
    });
  }

  this.selectionChange.emit(Array.from(selected));
}

  /* =========================================================
     PAGINATION
     ========================================================= */

  currentPage = 1;

  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' | null = null;

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

  get sortedData(): any[] {

    if (this.serverSideSorting) {
      return this.data;
    }

    if (!this.sortColumn || !this.sortDirection) {
      return this.data;
    }

    const column = this.columns.find(
      item => item.key === this.sortColumn
    );

    if (!column) {
      return this.data;
    }

    return [...this.data].sort((a, b) => {

      const aValue = column.sortValue
        ? column.sortValue(a)
        : this.getCellValue(a, column);

      const bValue = column.sortValue
        ? column.sortValue(b)
        : this.getCellValue(b, column);

      if (aValue == null && bValue == null) {
        return 0;
      }

      if (aValue == null) {
        return 1;
      }

      if (bValue == null) {
        return -1;
      }

      let comparison = 0;

      if (
        typeof aValue === 'number' &&
        typeof bValue === 'number'
      ) {
        comparison = aValue - bValue;

      } else if (
        aValue instanceof Date &&
        bValue instanceof Date
      ) {
        comparison =
          aValue.getTime() - bValue.getTime();

      } else if (
        typeof aValue === 'boolean' &&
        typeof bValue === 'boolean'
      ) {
        comparison =
          Number(aValue) - Number(bValue);

      } else {
        comparison = String(aValue).localeCompare(
          String(bValue),
          undefined,
          {
            numeric: true,
            sensitivity: 'base'
          }
        );
      }

      return this.sortDirection === 'asc'
        ? comparison
        : -comparison;
    });
  }

  get displayedData(): any[] {

    const sourceData = this.sortedData;

    if (!this.enablePagination) {
      return sourceData;
    }

    const startIndex =
      (this.currentPage - 1) * this.pageSize;

    return sourceData.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  get displayStart(): number {

    if (this.totalItems === 0) {
      return 0;
    }

    return (
      (this.currentPage - 1) *
      this.pageSize
    ) + 1;
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

  toggleSort(column: TableColumn): void {

    if (!column.sortable) {
      return;
    }

    if (this.sortColumn !== column.key) {

      this.sortColumn = column.key;
      this.sortDirection = 'asc';

    } else if (this.sortDirection === 'asc') {

      this.sortDirection = 'desc';

    } else {

      this.sortColumn = null;
      this.sortDirection = null;
    }

    this.currentPage = 1;
    this.closeActionMenu();

    if (this.serverSideSorting) {
      this.sortChange.emit({
        sortBy: this.sortColumn,
        sortDirection: this.sortDirection
      });
    }
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

  getResourceBarWidth(
  value: number | null | undefined,
  key: 'teacherCount' | 'studentCount' | 'classCount' | 'assignedRoleCount'
): number {

  const numericValue = Number(value) || 0;

  const maxValue = Math.max(
    ...this.data.map(row => Number(row?.[key]) || 0),
    1
  );

  return Math.max(
    numericValue > 0 ? 8 : 0,
    Math.round((numericValue / maxValue) * 100)
  );
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
  openActionRow: any = null;

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
    this.openActionRow = row;
  }

  closeActionMenu(): void {

    this.openActionRowId = null;
    this.openActionRow = null;
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

  onStudentNameClick(
    row: any,
    event: MouseEvent
  ): void {

    event.stopPropagation();

    const studentId =
      Number(row?.['id']);

    if (
      !Number.isFinite(studentId) ||
      studentId <= 0
    ) {
      return;
    }

    this.studentNameClick.emit(studentId);
  }
}
