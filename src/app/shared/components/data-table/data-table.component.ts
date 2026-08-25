import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'status' | 'current' | 'sections';
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
  @Input() showActions = false;
  @Input() currentField?: string;

  @Output() actionClick = new EventEmitter<any>();

  getCellValue(row: any, column: TableColumn): any {
    return row[column.key];
  }

  getBooleanCellValue(row: any, column: TableColumn): boolean {
    return Boolean(row[column.key]);
  }

  isCurrent(row: any): boolean {
    return this.currentField
      ? Boolean(row[this.currentField])
      : false;
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