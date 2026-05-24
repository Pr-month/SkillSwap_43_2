import { Request } from 'express';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export type TJwtPayload = { sub: string; email: string; role: Role };

export interface IAuthorizedRequest extends Request {
  user: TJwtPayload;
}
