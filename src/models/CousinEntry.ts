import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ICousinEntry extends Document {
  roomId: mongoose.Types.ObjectId;
  code: string;
  name: string;
  isActive: boolean;
  hasEntered: boolean;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CousinEntrySchema = new Schema<ICousinEntry>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'GameRoom',
      required: [true, 'Please provide a game room ID'],
    },
    code: {
      type: String,
      required: [true, 'Please provide an entry code'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    hasEntered: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  { timestamps: true }
);

// Add compound index to efficiently query entries by room
CousinEntrySchema.index({ roomId: 1, code: 1 });

export default models.CousinEntry || model<ICousinEntry>('CousinEntry', CousinEntrySchema); 