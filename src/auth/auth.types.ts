import type { UserRole } from '../users/users.enums';

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}
