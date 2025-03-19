import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface RewardTier {
  name: string;
  count: number;
  thrAmount: number;
}

export interface IGameRoom extends Document {
  name: string;
  code: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  rewardTiers: RewardTier[];
  createdAt: Date;
  updatedAt: Date;
}

const RewardTierSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a tier name'],
  },
  count: {
    type: Number,
    required: [true, 'Please provide a count'],
    min: [0, 'Count cannot be less than 0'],
  },
  thrAmount: {
    type: Number,
    required: [true, 'Please provide a THR amount'],
    min: [0, 'THR amount cannot be less than 0'],
  },
});

const GameRoomSchema = new Schema<IGameRoom>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a room name'],
      maxlength: [100, 'Room name cannot be more than 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Please provide a room code'],
      unique: true,
    },
    description: {
      type: String,
      required: false,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide the creator ID'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rewardTiers: {
      type: [RewardTierSchema],
      validate: {
        validator: function(tiers: RewardTier[]) {
          return tiers.length > 0;
        },
        message: 'At least one reward tier is required',
      },
    },
  },
  { timestamps: true }
);

export default models.GameRoom || model<IGameRoom>('GameRoom', GameRoomSchema); 