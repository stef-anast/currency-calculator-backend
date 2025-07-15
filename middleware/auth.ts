import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../config';
import { IRequest } from '../types';

const auth = (req: IRequest, res: Response, next: NextFunction) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({
      ok: false,
      msg: 'No token provided.',
    });
  }
  jwt.verify(
    token,
    config.accessTokenSecret,
    (_err: jwt.VerifyErrors | null, user: string | JwtPayload | undefined) => {
      if (_err) {
        return res.status(403).json({
          ok: false,
          msg: 'Invalid token.',
        });
      }

      // Type guard to ensure user is a JwtPayload with the expected properties
      if (
        !user ||
        typeof user === 'string' ||
        !('id' in user) ||
        !('roles' in user)
      ) {
        return res.status(403).json({
          ok: false,
          msg: 'Invalid token payload.',
        });
      }

      req.user = {
        id: (user as JwtPayload & { id: string; roles: string[] }).id,
        roles: (user as JwtPayload & { id: string; roles: string[] }).roles,
      };
      next();
    }
  );
};

export default auth;
