import mongoose, { Schema } from 'mongoose';

const MessageSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ChatSessionSchema = new Schema({
  messages: [MessageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const ChatSession = mongoose.models.ChatSession || mongoose.model('ChatSession', ChatSessionSchema);
