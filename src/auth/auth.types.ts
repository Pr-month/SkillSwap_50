import type { Request } from 'express';

export interface JwtPayload {
  sub: number;
}

export interface AuthRequest extends Request {
  user: JwtPayload;
}
