// Quick check script to see database status
require('dotenv').config();
const mongoose = require('mongoose');
const Video = require('../src/models/Video');

async function checkVideos() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/videosafe');

    const videos = await Video.find({}).select('originalName filename sensitivityScore categoryScores riskLevel status');

    console.log('\n📊 Current Videos in Database:\n');
    videos.forEach((v, i) => {
        console.log(`${i + 1}. ${v.originalName || v.filename}`);
        console.log(`   Status: ${v.status}, Score: ${v.sensitivityScore || 0}%`);
        console.log(`   Categories: NSFW=${v.categoryScores?.nsfw || 0}%, Violence=${v.categoryScores?.violence || 0}%, Scene=${v.categoryScores?.scene || 0}%`);
        console.log(`   Risk Level: ${v.riskLevel || 'N/A'}\n`);
    });

    console.log(`HuggingFace API Key: ${process.env.HUGGINGFACE_API_KEY ? '✅ SET' : '❌ MISSING'}\n`);

    process.exit(0);
}

checkVideos().catch(err => {
    console.error(err);
    process.exit(1);
});
