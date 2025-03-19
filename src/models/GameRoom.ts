import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface RewardTier {
  name: string;
  probability: number;
  thrAmount: number;
}

export interface IGameRoom extends Document {
  name: string;
  code: string;
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
  probability: {
    type: Number,
    required: [true, 'Please provide a probability'],
    min: [0, 'Probability cannot be less than 0'],
    max: [100, 'Probability cannot be more than 100'],
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
          // Ensure total probability doesn't exceed 100%
          const totalProbability = tiers.reduce((sum, tier) => sum + tier.probability, 0);
          return totalProbability <= 100;
        },
        message: 'Total probability cannot exceed 100%',
      },
    },
  },
  { timestamps: true }
);

export default models.GameRoom || model<IGameRoom>('GameRoom', GameRoomSchema); 