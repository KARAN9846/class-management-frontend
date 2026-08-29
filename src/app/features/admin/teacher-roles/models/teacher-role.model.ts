import { Permission } from './permission.model';

export interface TeacherRole {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeacherRoleRequest {
  name: string;
  description: string;
  permissionIds: number[];
}

export interface UpdateTeacherRoleRequest {
  name: string;
  description: string;
  permissionIds: number[];
}
