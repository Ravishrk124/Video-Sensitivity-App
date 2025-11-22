// backend/scripts/uploadTestVideo.js
// Programmatically upload and process the sample video

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Video = require('../src/models/Video');
const { processVideo } = require('../src/utils/videoProcessor');

async function uploadAndProcessTestVideo() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/videosafe');
        console.log('✅ Connected to MongoDB\n');

        // Find the sample video in project root
        const sampleVideoPath = path.join(__dirname, '../../valid_sample.mp4');

        if (!fs.existsSync(sampleVideoPath)) {
            console.error('❌ Sample video not found at:', sampleVideoPath);
            process.exit(1);
        }

        console.log('✅ Found sample video:', sampleVideoPath);
        const stats = fs.statSync(sampleVideoPath);
        console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB\n`);

        // Copy video to uploads folder
        const uploadsDir = path.join(__dirname, '../uploads/videos');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const timestamp = Date.now();
        const filename = `test_${timestamp}.mp4`;
        const destPath = path.join(uploadsDir, filename);

        console.log('📁 Copying video to uploads...');
        fs.copyFileSync(sampleVideoPath, destPath);
        console.log('✅ Video copied successfully\n');

        // Create video document
        console.log('💾 Creating database entry...');
        const video = new Video({
            originalName: 'Test Sample Video.mp4',
            filename: filename,
            path: destPath,
            mimetype: 'video/mp4',
            owner: null, // No owner for test
            status: 'uploaded',
            progress: 0,
            sensitivity: 'unknown',
            size: stats.size
        });

        await video.save();
        console.log('✅ Video saved to database');
        console.log(`   ID: ${video._id}\n`);

        // Process with enhanced AI
        console.log('🤖 Starting enhanced AI analysis...');
        console.log('   This will take 2-3 minutes...\n');

        await processVideo(video._id.toString(), null, null);

        // Fetch final result
        const result = await Video.findById(video._id);

        console.log('\n\n🎉 AI Analysis Complete!');
        console.log('════════════════════════════════════════════');
        console.log(`📊 Overall Score: ${result.sensitivityScore}%`);
        console.log(`🎚️  Risk Level: ${result.riskLevel || 'N/A'}`);
        console.log(`🏷️  Status: ${result.status}`);
        console.log(`🚩 Sensitivity: ${result.sensitivity}`);
        console.log('\n📈 Category Breakdown:');
        console.log(`   🔞 NSFW: ${result.categoryScores?.nsfw || 0}%`);
        console.log(`   ⚔️  Violence: ${result.categoryScores?.violence || 0}%`);
        console.log(`   🎬 Scene: ${result.categoryScores?.scene || 0}%`);
        console.log('\n📝 Analysis:');
        console.log(`   ${result.analysis || 'N/A'}`);
        console.log('\n📊 Metadata:');
        console.log(`   Frames Analyzed: ${result.aiMetadata?.framesAnalyzed || 0}/${result.aiMetadata?.totalFrames || 0}`);
        console.log(`   Flagged Frames: ${result.aiMetadata?.flaggedFrames || 0}`);
        console.log('════════════════════════════════════════════\n');

        console.log('✅ Test complete! Refresh your browser to see the results.');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        console.error(err.stack);
        process.exit(1);
    }
}

uploadAndProcessTestVideo();
