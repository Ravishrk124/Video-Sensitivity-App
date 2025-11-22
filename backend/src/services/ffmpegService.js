// backend/src/services/ffmpegService.js
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

/**
 * FFmpeg Service for video processing tasks
 * - Extract key frames
 * - Generate thumbnails
 * - Get video metadata
 */

/**
 * Extract key frames from video at specific timestamps
 * @param {string} videoPath - Absolute path to video file
 * @param {number} count - Number of frames to extract (default: 3)
 * @returns {Promise<string[]>} - Array of absolute paths to extracted frame images
 */
async function extractKeyFrames(videoPath, count = 3) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(videoPath)) {
            return reject(new Error(`Video file not found: ${videoPath}`));
        }

        // Get video duration first
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) {
                return reject(new Error(`FFprobe failed: ${err.message}`));
            }

            const duration = metadata?.format?.duration;
            if (!duration || duration <= 0) {
                return reject(new Error('Could not determine video duration'));
            }

            // Calculate timestamps for frame extraction
            // For count=3: extract at 10%, 50%, 90% to avoid black frames at start/end
            const timestamps = [];
            for (let i = 0; i < count; i++) {
                const percentage = (i + 1) / (count + 1); // e.g., 0.25, 0.5, 0.75 for count=3
                const timestamp = duration * percentage;
                timestamps.push(timestamp.toFixed(2));
            }

            const framesDir = path.join(path.dirname(videoPath), 'frames');
            if (!fs.existsSync(framesDir)) {
                fs.mkdirSync(framesDir, { recursive: true });
            }

            const baseName = path.parse(path.basename(videoPath)).name;
            const framePattern = `${baseName}-frame-%i.jpg`;
            const framePaths = [];

            console.log(`📸 Extracting ${count} frames at timestamps:`, timestamps.join(', '));

            ffmpeg(videoPath)
                .screenshots({
                    timestamps,
                    filename: framePattern,
                    folder: framesDir,
                    size: '640x?'
                })
                .on('end', () => {
                    // Build frame paths
                    for (let i = 0; i < timestamps.length; i++) {
                        const framePath = path.join(framesDir, framePattern.replace('%i', i + 1));
                        if (fs.existsSync(framePath)) {
                            framePaths.push(framePath);
                        }
                    }

                    if (framePaths.length === 0) {
                        return reject(new Error('No frames were extracted'));
                    }

                    console.log(`✅ Extracted ${framePaths.length} frames successfully`);
                    resolve(framePaths);
                })
                .on('error', (err) => {
                    console.error('❌ Frame extraction error:', err.message);
                    reject(new Error(`Frame extraction failed: ${err.message}`));
                });
        });
    });
}

/**
 * Generate a high-quality thumbnail for a video
 * Captures at 20% of duration or 5 seconds (whichever is smaller) to avoid black frames
 * @param {string} videoPath - Absolute path to video file
 * @param {string} outputDir - Directory to save thumbnail
 * @returns {Promise<string>} - Relative path to thumbnail (for DB storage)
 */
async function generateThumbnail(videoPath, outputDir) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!fs.existsSync(videoPath)) {
                return reject(new Error(`Video file not found: ${videoPath}`));
            }

            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // Get video duration first
            const metadata = await getVideoMetadata(videoPath);
            const duration = metadata.duration || 10; // fallback to 10s

            // Use 20% of duration or 5 seconds, whichever is smaller
            const timestamp = Math.min(duration * 0.2, 5.0);
            const timestampStr = timestamp.toFixed(2);

            const baseName = path.parse(path.basename(videoPath)).name;
            const thumbFilename = `${baseName}-${Date.now()}.jpg`;
            const fullThumbPath = path.join(outputDir, thumbFilename);

            console.log(`📸 Generating thumbnail at ${timestampStr}s (20% of ${duration.toFixed(1)}s)`);

            ffmpeg(videoPath)
                .screenshots({
                    count: 1,
                    timestamps: [timestampStr],
                    filename: thumbFilename,
                    folder: outputDir,
                    size: '1280x720' // High quality thumbnail
                })
                .on('end', () => {
                    if (fs.existsSync(fullThumbPath)) {
                        const relativePath = `/uploads/thumbnails/${thumbFilename}`;
                        console.log('✅ Thumbnail generated:', relativePath);
                        resolve(relativePath);
                    } else {
                        reject(new Error('Thumbnail file was not created'));
                    }
                })
                .on('error', (err) => {
                    console.error('❌ Thumbnail generation error:', err.message);
                    reject(new Error(`Thumbnail generation failed: ${err.message}`));
                });
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Get video metadata (duration, resolution, etc.)
 * @param {string} videoPath - Absolute path to video file
 * @returns {Promise<{duration: number, width: number, height: number}>}
 */
async function getVideoMetadata(videoPath) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(videoPath)) {
            return reject(new Error(`Video file not found: ${videoPath}`));
        }

        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) {
                return reject(new Error(`FFprobe failed: ${err.message}`));
            }

            const duration = metadata?.format?.duration || 0;
            const videoStream = metadata?.streams?.find(s => s.codec_type === 'video');

            const result = {
                duration: Math.round(duration),
                width: videoStream?.width || 0,
                height: videoStream?.height || 0,
                codec: videoStream?.codec_name || 'unknown',
                bitrate: metadata?.format?.bit_rate || 0
            };

            resolve(result);
        });
    });
}

module.exports = {
    extractKeyFrames,
    generateThumbnail,
    getVideoMetadata
};
