import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IQuestion extends Document {
  roomId: mongoose.Types.ObjectId;
  content: string;
  options: string[];
  correctAnswer: number; // Index of correct option
  difficulty: 'bronze' | 'silver' | 'gold';
  isSolved: boolean;
  solvedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'GameRoom',
      required: [true, 'Please provide a game room ID'],
    },
    content: {
      type: String,
      required: [true, 'Please provide question content'],
    },
    options: {
      type: [String],
      required: [true, 'Please provide options'],
      validate: {
        validator: function(options: string[]) {
          return options.length >= 2; // At least 2 options for a question
        },
        message: 'A question must have at least 2 options',
      },
    },
    correctAnswer: {
      type: Number,
      required: [true, 'Please provide the correct answer index'],
      validate: {
        validator: function(this: IQuestion, index: number) {
          return index >= 0 && index < this.options.length;
        },
        message: 'Correct answer index must be valid',
      },
    },
    difficulty: {
      type: String,
      enum: ['bronze', 'silver', 'gold'],
      required: [true, 'Please provide a difficulty level'],
    },
    isSolved: {
      type: Boolean,
      default: false,
    },
    solvedBy: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  { timestamps: true }
);

export default models.Question || model<IQuestion>('Question', QuestionSchema); 