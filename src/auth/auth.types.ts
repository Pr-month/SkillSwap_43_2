import { Request } from 'express';
import { Roles } from '../users/users.enums';

export type TJwtPayload = {
  sub: string;
  email: string;
  role: Roles;
};

export interface IAuthorizedRequest extends Request {
  user: TJwtPayload;
}
