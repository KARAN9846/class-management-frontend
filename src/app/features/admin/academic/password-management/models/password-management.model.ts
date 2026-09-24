export type PasswordManagementRole = 'STUDENT' | 'TEACHER';

export interface PasswordManagementUser {
  userId: number;
  name: string;
  username: string;
  role: PasswordManagementRole;
  isActive: boolean;
}

export interface PasswordResetResponse {
  userId: number;
  name: string;
  username: string;
  temporaryPassword: string;
}