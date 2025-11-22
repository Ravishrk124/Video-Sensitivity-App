// backend/src/services/aiService.js
// Sightengine AI integration for content moderation
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const SIGHTENGINE_USER = process.env.SIGHTENGINE_USER;
const SIGHTENGINE_SECRET = process.env.SIGHTENGINE_SECRET;
const SIGHTENGINE_API = 'https://api.sightengine.com/1.0/check.json';

/**
 * Analyze a single frame using Sightengine API
 */
async function analyzeFrame(framePath, retries = 2) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            if (!SIGHTENGINE_USER || !SIGHTENGINE_SECRET) {
                throw new Error('Sightengine credentials missing in .env');
            }

            // Create form data with the image
            const form = new FormData();
            form.append('media', fs.createReadStream(framePath));
            form.append('models', 'nudity-2.0,offensive,gore');
            form.append('api_user', SIGHTENGINE_USER);
            form.append('api_secret', SIGHTENGINE_SECRET);

            const response = await axios.post(SIGHTENGINE_API, form, {
                headers: form.getHeaders(),
                timeout: 30000
            });

            const data = response.data;

            // Extract scores from Sightengine response
            const nsfwScore = extractNSFWScore(data);
            const violenceScore = extractViolenceScore(data);
            const sceneScore = extractSceneScore(data);

            return {
                nsfwScore,
                violenceScore,
                sceneScore,
                categories: {
                    nsfw: nsfwScore,
                    violence: violenceScore,
                    scene: sceneScore
                },
                details: data,
                source: 'sightengine'
            };

        } catch (err) {
            if (attempt < retries) {
                const waitTime = 1000 * attempt;
                console.warn(`  ⚠️  API error (attempt ${attempt}/${retries}), retrying in ${waitTime}ms...`);
                await new Promise(r => setTimeout(r, waitTime));
                continue;
            }

            console.warn(`  ⚠️  Sightengine error: ${err.message}`);
            return {
                nsfwScore: 0,
                violenceScore: 0,
                sceneScore: 0,
                categories: { nsfw: 0, violence: 0, scene: 0 },
                source: 'error',
                error: err.message
            };
        }
    }

    return {
        nsfwScore: 0,
        violenceScore: 0,
        sceneScore: 0,
        categories: { nsfw: 0, violence: 0, scene: 0 },
        source: 'error',
        error: 'Max retries exceeded'
    };
}

/**
 * Extract NSFW score from Sightengine nudity model
 */
function extractNSFWScore(data) {
    if (!data || !data.nudity) return 0;

    const nudity = data.nudity;

    // Combine different nudity categories
    const raw = (nudity.raw || 0);
    const partial = (nudity.partial || 0);
    const sexual_activity = (nudity.sexual_activity || 0);
    const sexual_display = (nudity.sexual_display || 0);

    // Weighted combination (sexual content weighted higher)
    const nsfwScore = Math.min(
        (sexual_activity * 1.0) +
        (sexual_display * 0.9) +
        (raw * 0.7) +
        (partial * 0.5),
        1.0
    );

    return nsfwScore;
}

/**
 * Extract violence/gore score from Sightengine
 */
function extractViolenceScore(data) {
    if (!data) return 0;

    let violenceScore = 0;

    // Gore detection
    if (data.gore && data.gore.prob) {
        violenceScore += data.gore.prob * 0.8;
    }

    // Offensive content (weapons, violence indicators)
    if (data.offensive && data.offensive.prob) {
        violenceScore += data.offensive.prob * 0.6;
    }

    return Math.min(violenceScore, 1.0);
}

/**
 * Extract scene/context score
 */
function extractSceneScore(data) {
    if (!data) return 0;

    let sceneScore = 0;

    // Use offensive content as scene indicator
    if (data.offensive && data.offensive.prob) {
        sceneScore += data.offensive.prob * 0.5;
    }

    // Add nudity context
    if (data.nudity && data.nudity.none !== undefined) {
        sceneScore += (1 - data.nudity.none) * 0.3;
    }

    return Math.min(sceneScore, 1.0);
}

/**
 * Smart frame sampling
 */
function selectSmartFrames(allFramePaths, maxFrames = 6) {
    if (allFramePaths.length <= maxFrames) return allFramePaths;

    const selected = [];
    selected.push(allFramePaths[0]);
    selected.push(allFramePaths[allFramePaths.length - 1]);

    const step = Math.floor((allFramePaths.length - 2) / (maxFrames - 2));
    for (let i = 1; i < maxFrames - 1; i++) {
        const index = Math.min(i * step, allFramePaths.length - 2);
        if (!selected.includes(allFramePaths[index])) {
            selected.push(allFramePaths[index]);
        }
    }

    return selected.sort((a, b) => allFramePaths.indexOf(a) - allFramePaths.indexOf(b));
}

/**
 * Main video analysis function
 */
async function analyzeVideo(framePaths) {
    console.log(`  🎬 Starting Sightengine AI analysis...`);
    console.log(`  📊 Total frames available: ${framePaths.length}`);

    if (!SIGHTENGINE_USER || !SIGHTENGINE_SECRET) {
        console.error('  ❌ Sightengine credentials missing!');
        console.error('  💡 Add SIGHTENGINE_USER and SIGHTENGINE_SECRET to .env');
        return {
            overallScore: 0,
            maxScore: 0,
            frameCount: framePaths.length,
            analysis: 'Analysis failed: Missing Sightengine credentials.',
            error: 'NO_CREDENTIALS'
        };
    }

    const sampled = selectSmartFrames(framePaths, 6);
    console.log(`  🎯 Selected ${sampled.length} key frames for analysis\n`);

    const frameResults = [];
    let maxScore = 0;
    let totalScore = 0;
    let successCount = 0;
    let flaggedCount = 0;

    const categoryScores = {
        nsfw: { total: 0, max: 0 },
        violence: { total: 0, max: 0 },
        scene: { total: 0, max: 0 }
    };

    // Analyze each frame
    for (let i = 0; i < sampled.length; i++) {
        console.log(`  🔍 Analyzing frame ${i + 1}/${sampled.length}...`);

        const result = await analyzeFrame(sampled[i]);
        frameResults.push(result);

        if (result.source !== 'error') {
            successCount++;

            // Calculate composite score (weighted average)
            const compositeScore = (
                result.nsfwScore * 0.5 +
                result.violenceScore * 0.3 +
                result.sceneScore * 0.2
            );

            if (compositeScore > maxScore) maxScore = compositeScore;
            totalScore += compositeScore;

            // Track category maxes
            if (result.nsfwScore > categoryScores.nsfw.max) categoryScores.nsfw.max = result.nsfwScore;
            if (result.violenceScore > categoryScores.violence.max) categoryScores.violence.max = result.violenceScore;
            if (result.sceneScore > categoryScores.scene.max) categoryScores.scene.max = result.sceneScore;

            categoryScores.nsfw.total += result.nsfwScore;
            categoryScores.violence.total += result.violenceScore;
            categoryScores.scene.total += result.sceneScore;

            const isFlagged = compositeScore > 0.5;
            if (isFlagged) flaggedCount++;

            console.log(`  ${isFlagged ? '🚩' : '✓'} Frame ${i + 1}: Overall=${(compositeScore * 100).toFixed(1)}% (NSFW=${(result.nsfwScore * 100).toFixed(1)}%, Violence=${(result.violenceScore * 100).toFixed(1)}%)`);
        } else {
            console.log(`  ⚠️  Frame ${i + 1}: Failed (${result.error})`);
        }

        // Rate limit delay (Sightengine free tier)
        await new Promise(r => setTimeout(r, 1000));
    }

    if (successCount === 0) {
        return {
            overallScore: 0,
            maxScore: 0,
            frameCount: sampled.length,
            analysis: 'Analysis failed: All API calls failed.',
            error: 'ALL_FRAMES_FAILED',
            recommendations: ['Check Sightengine credentials', 'Verify API quota']
        };
    }

    const averageScore = totalScore / successCount;

    // Determine risk level
    let riskLevel = 'low';
    let analysisText = 'Content appears safe.';
    const recommendations = [];

    if (maxScore > 0.7) {
        analysisText = 'High Risk: Significant sensitive content detected.';
        riskLevel = 'high';
        recommendations.push('⛔ Content should be flagged');
        recommendations.push('Manual review strongly recommended');
    } else if (maxScore > 0.5) {
        analysisText = 'Medium Risk: Some concerning content detected.';
        riskLevel = 'medium';
        recommendations.push('⚠️ Content may need review');
    } else if (maxScore > 0.3) {
        analysisText = 'Low Risk: Minor concerns detected.';
        riskLevel = 'low-medium';
        recommendations.push('✓ Content likely safe with minor concerns');
    } else {
        recommendations.push('✓ Content appears safe');
    }

    // Category-specific recommendations
    if (categoryScores.nsfw.max > 0.6) {
        recommendations.push(`🔞 NSFW content detected (${Math.round(categoryScores.nsfw.max * 100)}%)`);
    }
    if (categoryScores.violence.max > 0.4) {
        recommendations.push(`⚔️ Violence/gore detected (${Math.round(categoryScores.violence.max * 100)}%)`);
    }

    console.log(`\n  📈 Analysis Complete!`);
    console.log(`  Provider: Sightengine AI`);
    console.log(`  Overall Score: ${(averageScore * 100).toFixed(1)}%`);
    console.log(`  Peak Score: ${(maxScore * 100).toFixed(1)}%`);
    console.log(`  Flagged Frames: ${flaggedCount}/${sampled.length}`);
    console.log(`  Risk Level: ${riskLevel.toUpperCase()}\n`);

    return {
        overallScore: averageScore,
        maxScore,
        riskLevel,
        frameCount: sampled.length,
        totalFrames: framePaths.length,
        flaggedFrames: flaggedCount,
        analysis: analysisText,
        recommendations,
        categories: {
            nsfw: {
                average: categoryScores.nsfw.total / successCount,
                max: categoryScores.nsfw.max,
                confidence: successCount / sampled.length
            },
            violence: {
                average: categoryScores.violence.total / successCount,
                max: categoryScores.violence.max,
                confidence: successCount / sampled.length
            },
            scene: {
                average: categoryScores.scene.total / successCount,
                max: categoryScores.scene.max,
                confidence: successCount / sampled.length
            }
        },
        temporalAnalysis: {
            flaggedTimestamps: frameResults
                .map((r, i) => {
                    const score = (r.nsfwScore * 0.5 + r.violenceScore * 0.3 + r.sceneScore * 0.2);
                    return { score, index: i };
                })
                .filter(f => f.score > 0.5)
                .map(f => `${Math.floor((f.index / sampled.length) * 100)}%`),
            consistencyScore: 1 - (flaggedCount / sampled.length)
        },
        frameAnalysis: frameResults.map((r, i) => {
            const compositeScore = r.source !== 'error' ?
                (r.nsfwScore * 0.5 + r.violenceScore * 0.3 + r.sceneScore * 0.2) : 0;

            return {
                frameIndex: i,
                timestamp: `${Math.floor((i / sampled.length) * 100)}%`,
                compositeScore,
                isFlagged: compositeScore > 0.5,
                categories: {
                    nsfw: { score: r.categories.nsfw, details: r.details?.nudity || {} },
                    violence: { score: r.categories.violence, details: r.details?.gore || {} },
                    scene: { score: r.categories.scene, details: r.details?.offensive || {} }
                },
                errors: r.error ? [r.error] : []
            };
        }),
        metadata: {
            modelsUsed: ['Sightengine nudity-2.0', 'gore', 'offensive'],
            apiProvider: 'sightengine',
            samplingStrategy: 'smart-uniform',
            processingDate: new Date().toISOString()
        }
    };
}

module.exports = {
    analyzeVideo
};
