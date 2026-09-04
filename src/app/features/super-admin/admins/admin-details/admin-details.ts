import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import {
  AdminService,
  ApiResponse
} from '../services/admin.service';

import { AdminDetails } from '../../../../core/models/admin-details.model';

@Component({
  selector: 'app-admin-details',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './admin-details.html',
  styleUrl: './admin-details.scss'
})
export class AdminDetailsComponent {

  private readonly adminService = inject(AdminService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  admin: AdminDetails | null = null;

  loading = true;
  error = '';

  ngOnInit(): void {
    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!id) {
      this.error = 'Invalid admin ID.';
      this.loading = false;
      return;
    }

    this.loadAdminDetails(id);
  }

private loadAdminDetails(id: number): void {
  this.loading = true;
  this.error = '';

  this.adminService
    .getAdminDetails(id)
    .pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (response: ApiResponse<AdminDetails>) => {
        this.admin = response.data;
      },
      error: () => {
        this.error = 'Unable to load admin details.';
      }
    });
}

  goBack(): void {
    this.router.navigate([
      '/super-admin/admins'
    ]);
  }

  editAdmin(): void {
    if (!this.admin) {
      return;
    }

    this.router.navigate([
      '/super-admin/admins',
      this.admin.id,
      'edit'
    ]);
  }
}