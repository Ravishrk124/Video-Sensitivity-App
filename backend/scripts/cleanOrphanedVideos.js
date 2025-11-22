// backend/scripts/cleanOrphanedVideos.js
// Remove database entries for videos where the actual file is missing

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const Video = require('../src/models/Video');

async function cleanOrphanedVideos() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/videosafe');
        console.log('✅ Connected to MongoDB\n');

        const videos = await Video.find({});
        console.log(`📊 Found ${videos.length} videos in database\n`);

        let removed = 0;
        let kept = 0;

        for (const video of videos) {
            const hasFile = video.path && fs.existsSync(video.path);

            if (!hasFile) {
                console.log(`❌ Removing: ${video.originalName || video.filename} (file missing)`);
                await Video.findByIdAndDelete(video._id);
                removed++;
            } else {
                console.log(`✓ Keeping: ${video.originalName || video.filename} (file exists)`);
                kept++;
            }
        }

        console.log(`\n📊 Cleanup Summary:`);
        console.log(`   Removed: ${removed} orphaned entries`);
        console.log(`   Kept: ${kept} valid videos`);
        console.log(`\n✅ Database cleaned!`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

cleanOrphanedVideos();
