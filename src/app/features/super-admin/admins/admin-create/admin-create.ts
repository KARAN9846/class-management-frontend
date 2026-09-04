import {
  ChangeDetectorRef,
  Component,
  inject
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import {
  AdminService,
  ApiResponse
} from '../services/admin.service';

import { Admin } from '../../../../core/models/admin.model';
import { CreateAdminRequest } from '../../../../core/models/create-admin.model';


@Component({
  selector: 'app-admin-create',
  standalone: true,
imports: [
  ReactiveFormsModule
],
  templateUrl: './admin-create.html',
  styleUrl: './admin-create.scss'
})
export class AdminCreateComponent {

  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  saving = false;
  error = '';
  success = '';

  readonly adminForm = this.fb.nonNullable.group({
    email: ['', [
      Validators.required,
      Validators.email
    ]],

    password: ['', [
      Validators.required,
      Validators.minLength(6)
    ]],

    confirmPassword: ['', [
      Validators.required
    ]],

    organizationName: ['', [
      Validators.required
    ]]
  });

  save(): void {
    if (this.adminForm.invalid || this.saving) {
      this.adminForm.markAllAsTouched();
      return;
    }

    const {
      email,
      password,
      confirmPassword,
      organizationName
    } = this.adminForm.getRawValue();

    if (password !== confirmPassword) {
      this.adminForm.controls.confirmPassword.setErrors({
        passwordMismatch: true
      });

      return;
    }

    this.saving = true;
    this.error = '';
    this.success = '';

    const request: CreateAdminRequest = {
      email,
      password,
      organizationName
    };

    this.adminService
      .createAdmin(request)
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response: ApiResponse<Admin>) => {
          this.success =
            response.message || 'Admin created successfully.';

          this.adminForm.reset();

          this.cdr.detectChanges();
        },

        error: (error) => {
          this.error =
            error?.error?.message ||
            'Unable to create admin.';
        }
      });
  }

  cancel(): void {
    this.router.navigate([
      '/super-admin/admins'
    ]);
  }
}