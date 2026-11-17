import type { Request } from 'express';
import type { UserRole } from '../users/users.enums';

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user: JwtPayload;
}
