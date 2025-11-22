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
    let aiScore = 0;
    let aiSensitivity = 'safe';
    let flaggedReason = '';

    try {
      emitUpdate({ videoId, progress: 50, status: 'analyzing' });

      // Extract more key frames for better analysis (will be smart-sampled by AI service)
      const framePaths = await ffmpegService.extractKeyFrames(videoPath, 12);
      const analysisResults = await aiService.analyzeVideo(framePaths);

      // Convert overall score (0-1) to percentage
      aiScore = Math.round(analysisResults.maxScore * 100); // Use max score for flagging
      const avgScore = Math.round(analysisResults.overallScore * 100);

      // Determine sensitivity based on risk level
      const riskLevel = analysisResults.riskLevel || 'low';
      aiSensitivity = ['high', 'medium'].includes(riskLevel) ? 'flagged' : 'safe';

      // Build detailed flagged reason
      if (aiSensitivity === 'flagged') {
        const reasons = [];
        if (analysisResults.categories?.nsfw?.max > 0.5) {
          reasons.push(`NSFW: ${Math.round(analysisResults.categories.nsfw.max * 100)}%`);
        }
        if (analysisResults.categories?.violence?.max > 0.4) {
          reasons.push(`Violence: ${Math.round(analysisResults.categories.violence.max * 100)}%`);
        }
        flaggedReason = `AI detected sensitive content - ${reasons.join(', ')} (Risk: ${riskLevel}, analyzed ${analysisResults.frameCount} frames)`;
      }

      // Extract category scores (round to nearest integer)
      const categoryScores = {
        nsfw: Math.round((analysisResults.categories?.nsfw?.max || 0) * 100),
        violence: Math.round((analysisResults.categories?.violence?.max || 0) * 100),
        scene: Math.round((analysisResults.categories?.scene?.max || 0) * 100)
      };

      // Ensure at least 1% shows if detection found anything (not 0%)
      if (aiScore === 0 && analysisResults.categories) {
        if (analysisResults.categories.nsfw?.max > 0 ||
          analysisResults.categories.violence?.max > 0 ||
          analysisResults.categories.scene?.max > 0) {
          aiScore = Math.max(
            categoryScores.nsfw,
            categoryScores.violence,
            categoryScores.scene,
            1 // Minimum 1% if anything detected
          );
        }
      }

      // Update video document with comprehensive AI results
      await Video.findByIdAndUpdate(videoId, {
        sensitivityScore: aiScore, // Peak score for flagging
        sensitivity: aiSensitivity,
        flaggedReason,
        riskLevel,
        categoryScores,
        analysis: analysisResults.analysis,
        aiMetadata: {
          overallScore: avgScore,
          maxScore: aiScore,
          framesAnalyzed: analysisResults.frameCount,
          totalFrames: analysisResults.totalFrames,
          flaggedFrames: analysisResults.flaggedFrames,
          recommendations: analysisResults.recommendations,
          categories: analysisResults.categories,
          temporalAnalysis: analysisResults.temporalAnalysis,
          metadata: analysisResults.metadata
        },
        progress: 90
      });

      // Emit update to clients
      emitUpdate({
        videoId,
        progress: 90,
        sensitivity: aiSensitivity,
        sensitivityScore: aiScore,
        riskLevel,
        categoryScores
      });

      console.log(`  ✅ AI Analysis complete: ${aiSensitivity.toUpperCase()} (Peak: ${aiScore}%, Avg: ${avgScore}%, Risk: ${riskLevel})`);

      // Cleanup temporary frame files
      framePaths.forEach(fp => {
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
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