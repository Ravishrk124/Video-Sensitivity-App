// backend/scripts/reanalyzeVideos.js
// Script to re-analyze all existing videos with the new enhanced AI system

require('dotenv').config();
const mongoose = require('mongoose');
const Video = require('../src/models/Video');
const { processVideo } = require('../src/utils/videoProcessor');

async function reanalyzeAllVideos() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/videosafe');
        console.log('✅ Connected to MongoDB\n');

        // Get all videos that need re-analysis
        const videos = await Video.find({
            status: { $in: ['done', 'flagged'] },
            $or: [
                { categoryScores: { $exists: false } },
                { riskLevel: { $exists: false } },
                { 'categoryScores.nsfw': 0, 'categoryScores.violence': 0, 'categoryScores.scene': 0 }
            ]
        });

        console.log(`📊 Found ${videos.length} videos to re-analyze\n`);

        for (let i = 0; i < videos.length; i++) {
            const video = videos[i];
            console.log(`\n[${i + 1}/${videos.length}] Re-analyzing: ${video.originalName || video.filename}`);
            console.log(`   Current status: ${video.status}, sensitivity: ${video.sensitivity}`);

            try {
                // Set status back to processing
                video.status = 'processing';
                video.progress = 0;
                await video.save();

                // Re-process with enhanced AI
                await processVideo(video._id.toString(), null, null);

                console.log(`   ✅ Re-analysis complete!`);
            } catch (err) {
                console.error(`   ❌ Re-analysis failed: ${err.message}`);
            }

            // Small delay between videos to respect API limits
            if (i < videos.length - 1) {
                console.log(`   ⏳ Waiting 5 seconds before next video...`);
                await new Promise(r => setTimeout(r, 5000));
            }
        }

        console.log('\n✅ All videos re-analyzed!');
        console.log('📊 Summary:');

        const updated = await Video.find({ categoryScores: { $exists: true } });
        console.log(`   Videos with enhanced analysis: ${updated.length}`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

reanalyzeAllVideos();
