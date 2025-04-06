// src/models/user.ts
import mongoose, { Schema } from 'mongoose';

const UserProfileSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  preferences: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  memoryItems: [{
    type: Schema.Types.ObjectId,
    ref: 'MemoryItem'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const MemoryItemSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  importance: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', UserProfileSchema);
export const MemoryItem = mongoose.models.MemoryItem || mongoose.model('MemoryItem', MemoryItemSchema);