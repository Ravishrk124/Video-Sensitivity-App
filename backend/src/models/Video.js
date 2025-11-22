// backend/src/models/Video.js
const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: { type: String },
  originalName: { type: String },
  filename: { type: String },
  path: { type: String },
  mimetype: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'uploaded' },
  progress: { type: Number, default: 0 },
  sensitivity: { type: String, default: 'unknown' }, // 'safe', 'flagged', 'unknown'
  sensitivityScore: { type: Number, default: 0, min: 0, max: 100 }, // AI score 0-100
  manualReview: { type: Boolean, default: false },
  flaggedReason: { type: String },
  size: { type: Number }, // file size in bytes
  duration: { type: Number, default: 0 }, // duration in seconds
  thumbnail: { type: String },
  analysis: { type: String }, // Detailed analysis text
  // Enhanced AI Analysis Fields
  riskLevel: { type: String }, // 'low', 'low-medium', 'medium', 'high'
  categoryScores: {
    nsfw: { type: Number, default: 0 },
    violence: { type: Number, default: 0 },
    scene: { type: Number, default: 0 }
  },
  aiMetadata: { type: mongoose.Schema.Types.Mixed }, // Full analysis results

}, { timestamps: true });

module.exports = mongoose.model('Video', VideoSchema);