import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  type?:
  | 'text'
  | 'status'
  | 'current'
  | 'sections'
  | 'permissions'
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
  imports: [CommonModule, StatusBadgeComponent],
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
  @Input() currentField?: string;

  @Output() actionClick = new EventEmitter<any>();

  getCellValue(row: any, column: TableColumn): any {
    return row[column.key];
  }

  getBooleanCellValue(row: any, column: TableColumn): boolean {
    return Boolean(row[column.key]);
  }

  getStatusLabel(row: any, column: TableColumn): string {
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
    return 'success';

  case 'CLOSED':
    return 'danger';

  case 'DRAFT':
    return 'warning';

  case 'PRESENT':
    return 'success';

  case 'ABSENT':
    return 'danger';

  default:
    return 'warning';
}
}

formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

  isCurrent(row: any): boolean {
    return this.currentField
      ? Boolean(row[this.currentField])
      : false;
  }

  getRowActions(row: any): TableAction[] {
  return this.rowActions
    ? this.rowActions(row)
    : this.actions;
}

  onActionClick(action: TableAction, row: any): void {
    this.actionClick.emit({ action, row });
  }

  trackColumn(index: number, column: TableColumn): string {
    return column.key;
  }

  trackRow(index: number, row: any): any {
    return row?.id ?? index;
  }

  trackAction(index: number, action: TableAction): string {
    return action.type;
  }

  trackItem(index: number, item: any): any {
    return item?.id ?? index;
  }
}