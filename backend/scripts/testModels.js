// backend/scripts/testModels.js
require('dotenv').config();
const { findWorkingModel } = require('../src/services/aiService');

async function test() {
    console.log('🔍 Testing Hugging Face models...\n');

    const model = await findWorkingModel();

    if (model) {
        console.log(`\n✅ SUCCESS! Working model found: ${model.name}`);
        console.log(`   URL: ${model.url}\n`);
        process.exit(0);
    } else {
        console.log('\n❌ FAILED: No working Hugging Face models found!');
        console.log('\n📋 Alternative Options:\n');
        console.log('1. LOCAL AI (RECOMMENDED):');
        console.log('   npm install @tensorflow/tfjs-node nsfwjs');
        console.log('   - Works offline');
        console.log('   - No API key needed');
        console.log('   - Fast and reliable\n');
        console.log('2. ALTERNATIVE APIS:');
        console.log('   - Sightengine (free tier: https://sightengine.com)');
        console.log('   - Google Cloud Vision API');
        console.log('   - AWS Rekognition\n');
        console.log('3. UPDATE HUGGING FACE TOKEN:');
        console.log('   - Go to: https://huggingface.co/settings/tokens');
        console.log('   - Create new token');
        console.log('   - Update .env file\n');
        process.exit(1);
    }
}

test().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
