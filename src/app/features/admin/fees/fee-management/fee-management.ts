import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { StudentFeeList } from '../student-fee-list/student-fee-list';

@Component({
  selector: 'app-fee-management',
  standalone: true,
  imports: [
    StudentFeeList
  ],
  templateUrl: './fee-management.html',
  styleUrl: './fee-management.scss'
})
export class FeeManagementComponent {

  constructor(
    private readonly router: Router
  ) {}

  openFeeStructures(): void {
    this.router.navigate(['/admin/fees/fee-structures']);
  }

  openReceiptSettings(): void {
    this.router.navigate(['/admin/fees/receipt-settings']);
  }
}