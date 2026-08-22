import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {

  @Input() currentPage = 1;

  @Input() totalItems = 0;

  @Input() pageSize = 10;

  @Input() maxVisiblePages = 5;

  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.totalItems / this.pageSize)
    );
  }

  get startItem(): number {
    if (this.totalItems === 0) {
      return 0;
    }

    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.totalItems
    );
  }

  get pages(): (number | string)[] {

    const total = this.totalPages;
    const current = this.currentPage;
    const max = this.maxVisiblePages;

    if (total <= max) {
      return Array.from(
        { length: total },
        (_, index) => index + 1
      );
    }

    const pages: (number | string)[] = [];

    pages.push(1);

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    if (start > 2) {
      pages.push('...');
    }

    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    if (end < total - 1) {
      pages.push('...');
    }

    pages.push(total);

    return pages;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.changePage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.changePage(this.currentPage + 1);
    }
  }

  changePage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }

    this.pageChange.emit(page);
  }

  isCurrentPage(page: number | string): boolean {
    return page === this.currentPage;
  }
}