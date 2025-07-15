import { Response, NextFunction } from 'express';
import { IRequest } from '../types';

export const editor = (req: IRequest, res: Response, next: NextFunction) => {
  if (!req.user?.roles.includes('editor')) {
    return res.status(403).json({
      ok: false,
      msg: 'Editor permissions required. Access denied.',
    });
  }
  next();
};

export const viewer = (req: IRequest, res: Response, next: NextFunction) => {
  if (!req.user?.roles.includes('viewer')) {
    return res.status(403).json({
      ok: false,
      msg: 'Viewer permissions required. Access denied.',
    });
  }
  next();
};
