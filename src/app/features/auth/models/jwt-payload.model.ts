import { UserRole } from './user-role.model';

export interface JwtPayload {
  sub: string;
  role: UserRole;
  iat: number;
  exp: number;
}