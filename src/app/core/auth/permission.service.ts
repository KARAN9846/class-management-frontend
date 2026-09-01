import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { ApiService } from '../services/api.service';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  private readonly api = inject(ApiService);

  private permissions = new Set<string>();

  loadMyPermissions(): Observable<ApiResponse<string[]>> {

    return this.api
      .get<ApiResponse<string[]>>('/permissions/me')
      .pipe(
        tap(response => {
          this.permissions = new Set(
            response.success
              ? response.data ?? []
              : []
          );
        })
      );
  }

  hasPermission(permission: string): boolean {
    return this.permissions.has(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission =>
      this.hasPermission(permission)
    );
  }

  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission =>
      this.hasPermission(permission)
    );
  }

  clear(): void {
    this.permissions.clear();
  }
}