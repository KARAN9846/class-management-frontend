import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';
import { Permission } from '../models/permission.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  private readonly api = inject(ApiService);

  getPermissions(): Observable<ApiResponse<Permission[]>> {

    return this.api.get<ApiResponse<Permission[]>>(
      '/permissions'
    );
  }
}
