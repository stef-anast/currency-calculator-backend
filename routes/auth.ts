import express, { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { TokenService } from '../services/tokenService';
import User, { IUser } from '../models/user';

const router: Router = express.Router();

router.post(
  '/login',
  body('email').isEmail().normalizeEmail(),
  body('password').not().isEmpty(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        errors: errors.array(),
      });
    }

    try {
      const user: IUser | null = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(401).json({
          ok: false,
          msg: 'Login failed.',
        });
      }

      const valid = await bcrypt.compare(req.body.password, user.password);
      if (!valid) {
        throw new Error('Login failed.');
      }

      const accessToken = TokenService.generateAccessToken(
        user._id,
        user.roles
      );
      const refreshToken = await TokenService.createRefreshToken(user._id);

      return res.json({
        ok: true,
        user: {
          email: user.email,
          roles: user.roles,
        },
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    } catch {
      return res.status(401).json({
        ok: false,
        msg: 'Login failed.',
      });
    }
  }
);

router.delete('/logout', async (req: Request, res: Response) => {
  const token = req.body.token;
  if (!token) {
    return res.status(400).json({
      ok: false,
      msg: 'No token provided.',
    });
  }

  const revoked = await TokenService.revokeRefreshToken(token);
  if (!revoked) {
    return res.status(400).json({
      ok: false,
      msg: 'Invalid token.',
    });
  }

  return res.status(204).send();
});

router.post('/refresh', async (req: Request, res: Response) => {
  const refreshToken = req.body.token;
  if (!refreshToken) {
    return res.status(401).json({
      ok: false,
      msg: 'No token provided.',
    });
  }

  try {
    const userId = await TokenService.validateRefreshToken(refreshToken);
    if (!userId) {
      return res.status(403).json({
        ok: false,
        msg: 'Invalid token.',
      });
    }

    const user: IUser | null = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(401).json({
        ok: false,
        msg: 'Invalid token.',
      });
    }

    const accessToken = TokenService.generateAccessToken(user._id, user.roles);
    return res.json({
      ok: true,
      accessToken: accessToken,
    });
  } catch {
    return res.status(401).json({
      ok: false,
      msg: 'Invalid token.',
    });
  }
});

router.post(
  '/register',
  body('email').isEmail().normalizeEmail(),
  body('password')
    .isLength({ min: 5 })
    .withMessage('must be at least 5 chars long'),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        errors: errors.array(),
      });
    }
    const email = req.body.email;
    const password = req.body.password;

    const anotherUser = await User.findOne({ email: email });
    if (anotherUser) {
      return res.status(400).json({
        ok: false,
        msg: `${email} already exists.`,
      });
    }
    const user = new User({
      email: email,
      password: await bcrypt.hash(password, 10),
      roles: ['viewer'],
    });
    try {
      const newUser = await user.save();
      return res.status(201).json({
        ok: true,
        msg: `Successful registration: ${newUser.email}`,
      });
    } catch {
      return res.status(400).json({
        ok: false,
        msg: 'User registration failed.',
      });
    }
  }
);

export default router;
