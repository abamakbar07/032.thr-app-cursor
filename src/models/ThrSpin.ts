import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IThrSpin extends Document {
  userId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  tierName: string;
  thrAmount: number;
  createdAt: Date;
}

const ThrSpinSchema = new Schema<IThrSpin>(
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
    tierName: {
      type: String,
      required: [true, 'Please provide a tier name'],
    },
    thrAmount: {
      type: Number,
      required: [true, 'Please provide a THR amount'],
      min: [0, 'THR amount cannot be less than 0'],
    },
  },
  { timestamps: true }
);

// Add compound index to efficiently query user's total earnings per room
ThrSpinSchema.index({ userId: 1, roomId: 1 });

export default models.ThrSpin || model<IThrSpin>('ThrSpin', ThrSpinSchema); 