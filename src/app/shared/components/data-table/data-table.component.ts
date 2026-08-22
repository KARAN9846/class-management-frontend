import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableAction {
  label: string;
  type: string;
  icon?: string;
  danger?: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent {

  @Input() columns: TableColumn[] = [];

  @Input() data: Record<string, unknown>[] = [];

  @Input() loading = false;

  @Input() emptyMessage = 'No records found.';

  @Input() actions: TableAction[] = [];

  @Input() showActions = false;

  @Input() rowKey = 'id';

  @Output() actionClick = new EventEmitter<{
    action: TableAction;
    row: Record<string, unknown>;
  }>();


  getCellValue(row: Record<string, unknown>, column: TableColumn): unknown {
    return row[column.key];
  }


  onActionClick(
    action: TableAction,
    row: Record<string, unknown>
  ): void {

    this.actionClick.emit({
      action,
      row
    });
  }


  trackRow(
    index: number,
    row: Record<string, unknown>
  ): unknown {

    return row[this.rowKey] ?? index;
  }


  trackColumn(
    index: number,
    column: TableColumn
  ): string {

    return column.key;
  }
}