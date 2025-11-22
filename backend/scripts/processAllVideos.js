// backend/scripts/processAllVideos.js
// Process ALL videos including those in 'uploaded' status

require('dotenv').config();
const mongoose = require('mongoose');
const Video = require('../src/models/Video');
const { processVideo } = require('../src/utils/videoProcessor');

async function processAllVideos() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/videosafe');
        console.log('✅ Connected to MongoDB\n');

        // Get ALL videos regardless of status
        const videos = await Video.find({});

        console.log(`📊 Found ${videos.length} videos total\n`);

        for (let i = 0; i < videos.length; i++) {
            const video = videos[i];
            console.log(`\n[${i + 1}/${videos.length}] Processing: ${video.originalName || video.filename}`);
            console.log(`   ID: ${video._id}`);
            console.log(`   Current status: ${video.status}`);
            console.log(`   Path exists: ${video.path ? '✓' : '✗'}`);

            try {
                // Set status to processing
                video.status = 'processing';
                video.progress = 0;
                await video.save();

                // Process with enhanced AI
                console.log(`   🤖 Starting AI analysis...`);
                await processVideo(video._id.toString(), null, null);

                // Check result
                const updated = await Video.findById(video._id);
                console.log(`   ✅ Complete! Status: ${updated.status}, Score: ${updated.sensitivityScore}%`);
                console.log(`   Categories: NSFW=${updated.categoryScores?.nsfw || 0}%, Violence=${updated.categoryScores?.violence || 0}%, Scene=${updated.categoryScores?.scene || 0}%`);
            } catch (err) {
                console.error(`   ❌ Processing failed: ${err.message}`);
            }

            // Delay between videos for API rate limiting
            if (i < videos.length - 1) {
                const delay = 10;
                console.log(`   ⏳ Waiting ${delay}s before next video...`);
                await new Promise(r => setTimeout(r, delay * 1000));
            }
        }

        console.log('\n🎉 All videos processed!');

        const summary = await Video.aggregate([
            {
                $group: {
                    _id: '$riskLevel',
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log('\n📊 Risk Level Summary:');
        summary.forEach(s => {
            console.log(`   ${s._id || 'unknown'}: ${s.count} videos`);
        });

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

processAllVideos();
