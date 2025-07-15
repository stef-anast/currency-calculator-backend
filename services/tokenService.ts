import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import RefreshToken from '../models/refreshToken';
import { config } from '../config';

export class TokenService {
  private static readonly REFRESH_TOKEN_EXPIRY_DAYS = 30;

  static generateRefreshToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  static async createRefreshToken(userId: string): Promise<string> {
    const token = this.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);

    const refreshToken = new RefreshToken({
      token,
      userId,
      expiresAt,
    });

    await refreshToken.save();
    return token;
  }

  static async validateRefreshToken(token: string): Promise<string | null> {
    const refreshToken = await RefreshToken.findOne({
      token,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });

    return refreshToken ? refreshToken.userId : null;
  }

  static async revokeRefreshToken(token: string): Promise<boolean> {
    const result = await RefreshToken.updateOne(
      { token, isRevoked: false },
      { isRevoked: true }
    );

    return result.modifiedCount > 0;
  }

  static async revokeAllUserTokens(userId: string): Promise<number> {
    const result = await RefreshToken.updateMany(
      { userId, isRevoked: false },
      { isRevoked: true }
    );

    return result.modifiedCount;
  }

  // Clean up expired and revoked tokens
  static async cleanupExpiredTokens(): Promise<number> {
    const result = await RefreshToken.deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        {
          isRevoked: true,
          createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      ],
    });

    return result.deletedCount || 0;
  }

  static generateAccessToken(userId: string, roles: string[]): string {
    return jwt.sign(
      {
        id: userId,
        roles: roles,
      },
      config.accessTokenSecret,
      {
        expiresIn: config.accessTokenExp,
        algorithm: 'HS256',
      } as jwt.SignOptions
    );
  }
}
