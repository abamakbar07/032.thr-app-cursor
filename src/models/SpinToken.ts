import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ISpinToken extends Document {
  userId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  tokenCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SpinTokenSchema = new Schema<ISpinToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user ID'],
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'GameRoom',
      required: [true, 'Please provide a game room ID'],
    },
    tokenCount: {
      type: Number,
      default: 0,
      min: [0, 'Token count cannot be less than 0'],
    },
  },
  { timestamps: true }
);

// Add unique compound index to ensure one record per user per room
SpinTokenSchema.index({ userId: 1, roomId: 1 }, { unique: true });

export default models.SpinToken || model<ISpinToken>('SpinToken', SpinTokenSchema); 