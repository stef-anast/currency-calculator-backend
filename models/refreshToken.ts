import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshToken extends Document {
  _id: string;
  token: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  isRevoked: boolean;
}

const refreshTokenSchema: Schema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isRevoked: {
    type: Boolean,
    default: false,
  },
});

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({ userId: 1 });

export default mongoose.model<IRefreshToken>(
  'RefreshToken',
  refreshTokenSchema
);
