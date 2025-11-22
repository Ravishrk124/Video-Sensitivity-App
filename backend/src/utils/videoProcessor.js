// backend/src/utils/videoProcessor.js
const path = require('path');
const fs = require('fs');
const Video = require('../models/Video');
const ffmpegService = require('../services/ffmpegService');
const aiService = require('../services/aiService');

/**
 * processVideo - Complete video processing pipeline with AI analysis
 * @param {string} videoId - mongoose id of Video document
 * @param {object} io - socket.io server instance (optional)
 * @param {string} triggeringUserId - id of the user who started upload (optional)
 */
async function processVideo(videoId, io, triggeringUserId) {
  const emitUpdate = (payload) => {
    try {
      io?.to(`video:${videoId}`).emit('processing:update', payload);
      io?.emit('processingProgress', payload); // Global broadcast for dashboard
    } catch (e) {
      console.warn('Socket emit error:', e.message);
    }
  };

  const emitFinished = (payload) => {
    try {
      io?.to(`video:${videoId}`).emit('processing:finished', payload);
      io?.emit('processingComplete', payload); // Global broadcast for dashboard
    } catch (e) {
      console.warn('Socket emit error:', e.message);
    }
  };

  try {
    console.log(`🎬 Starting video processing for: ${videoId}`);

    const video = await Video.findById(videoId);
    if (!video) {
      throw new Error(`Video ${videoId} not found`);
    }

    const videoPath = video.path;
    if (!videoPath || !fs.existsSync(videoPath)) {
      await Video.findByIdAndUpdate(videoId, {
        status: 'failed',
        progress: 100
      });
      emitFinished({
        videoId,
        status: 'failed',
        sensitivity: 'unknown',
        progress: 100,
        message: 'Video file not found'
      });
      return false;
    }

    // Update status: processing started
    await Video.findByIdAndUpdate(videoId, {
      status: 'processing',
      progress: 10
    });
    emitUpdate({ videoId, status: 'processing', progress: 10 });

    // Step 1: Extract metadata
    console.log('  📊 Extracting metadata...');
    let metadata = { duration: 0 };
    try {
      metadata = await ffmpegService.getVideoMetadata(videoPath);
      await Video.findByIdAndUpdate(videoId, {
        duration: metadata.duration,
        progress: 20
      });
      emitUpdate({ videoId, progress: 20 });
    } catch (err) {
      console.warn('  ⚠️ Metadata extraction failed:', err.message);
    }

    // Step 2: Generate thumbnail
    console.log('  📸 Generating thumbnail...');
    let thumbnailPath = null;
    try {
      const uploadsRoot = path.join(process.cwd(), 'uploads');
      const thumbsDir = path.join(uploadsRoot, 'thumbnails');
      if (!fs.existsSync(thumbsDir)) {
        fs.mkdirSync(thumbsDir, { recursive: true });
      }

      thumbnailPath = await ffmpegService.generateThumbnail(videoPath, thumbsDir);
      await Video.findByIdAndUpdate(videoId, {
        thumbnail: thumbnailPath,
        progress: 40
      });
      emitUpdate({ videoId, progress: 40, thumbnail: thumbnailPath });
    } catch (err) {
      console.warn('  ⚠️ Thumbnail generation failed:', err.message);
    }

    // Step 3: AI Sensitivity Analysis
    console.log('  🤖 Running AI sensitivity analysis...');
    let aiResult = { score: 0, sensitivity: 'safe', details: {} };

    try {
      emitUpdate({ videoId, progress: 50, status: 'analyzing' });

      aiResult = await aiService.analyzeVideo(videoPath);

      console.log(`  ✅ AI Analysis Complete:`, aiResult);

      await Video.findByIdAndUpdate(videoId, {
        // Extract 5 frames at strategic points for comprehensive analysis
        const framePaths = await ffmpegService.extractKeyFrames(videoPath, 5);

        const analysisResults = await aiService.analyzeVideo(framePaths);

        aiScore = Math.round(analysisResults.averageScore * 100);
        aiSensitivity = aiScore >= 50 ? 'flagged' : 'safe';

        if(aiScore >= 50) {
        flaggedReason = `AI detected potential NSFW content (${aiScore}% confidence across 5 frames)`;
      }

      await Video.findByIdAndUpdate(videoId, {
        sensitivityScore: aiScore,
        sensitivity: aiSensitivity,
        flaggedReason,
        progress: 90
      });

      emitUpdate({
        videoId,
        progress: 90,
        sensitivity: aiSensitivity,
        sensitivityScore: aiScore
      });

      console.log(`  ✅ AI Analysis complete: ${aiSensitivity} (${aiScore}% confidence from 5 frames)`);

      // Cleanup frames
      framePaths.forEach(framePath => {
        if (fs.existsSync(framePath)) fs.unlinkSync(framePath);
      });

    } catch (err) {
      console.error('  ⚠️ AI analysis failed:', err.message);
      // Continue with safe default if AI fails
      aiScore = 0;
      aiSensitivity = 'safe';
      flaggedReason = `AI analysis failed: ${err.message}`;
      await Video.findByIdAndUpdate(videoId, {
        sensitivityScore: aiScore,
        sensitivity: aiSensitivity,
        flaggedReason,
        progress: 90
      });
      emitUpdate({
        videoId,
        progress: 90,
        sensitivity: aiSensitivity,
        sensitivityScore: aiScore
      });
    }

    // Step 4: Finalize
    const finalStatus = aiSensitivity === 'flagged' ? 'flagged' : 'done';

    await Video.findByIdAndUpdate(videoId, {
      status: finalStatus,
      progress: 100,
      updatedAt: new Date()
    });

    const finalPayload = {
      videoId,
      status: finalStatus,
      sensitivity: aiSensitivity,
      sensitivityScore: aiScore,
      progress: 100,
      thumbnail: thumbnailPath,
      duration: metadata.duration
    };

    emitFinished(finalPayload);

    console.log(`✅ Video processing complete: ${videoId} - ${finalStatus.toUpperCase()}`);
    return true;

  } catch (err) {
    console.error('❌ Video processing error:', err.message);
    console.error(err.stack);

    try {
      await Video.findByIdAndUpdate(videoId, {
        status: 'failed',
        progress: 100
      });
      emitFinished({
        videoId,
        status: 'failed',
        sensitivity: 'unknown',
        progress: 100,
        message: err.message
      });
    } catch (e) {
      console.error('Failed to update video status:', e.message);
    }

    return false;
  }
}

module.exports = { processVideo };