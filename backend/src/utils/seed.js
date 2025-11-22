// backend/src/utils/seed.js
const User = require('../models/User');

/**
 * Seed default admin user if none exists
 * Called on server startup
 */
async function seedAdminUser() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@1234';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('✅ Admin user already exists:', adminEmail);
            return existingAdmin;
        }

        // Create admin user
        const admin = new User({
            name: 'Administrator',
            email: adminEmail,
            password: adminPassword,
            role: 'admin'
        });

        await admin.save();
        console.log('✅ Admin user created:', adminEmail);
        console.log('   Password:', adminPassword);

        return admin;
    } catch (error) {
        console.error('❌ Error seeding admin user:', error.message);
        throw error;
    }
}

/**
 * Seed sample users for development (optional)
 */
async function seedSampleUsers() {
    try {
        // Create editor if not exists
        const editorEmail = 'editor1@example.com';
        const existingEditor = await User.findOne({ email: editorEmail });

        if (!existingEditor) {
            const editor = new User({
                name: 'Sample Editor',
                email: editorEmail,
                password: 'Editor@1234',
                role: 'editor'
            });
            await editor.save();
            console.log('✅ Sample editor user created:', editorEmail);
        }

        // Create viewer if not exists
        const viewerEmail = 'viewer1@example.com';
        const existingViewer = await User.findOne({ email: viewerEmail });

        if (!existingViewer) {
            const viewer = new User({
                name: 'Sample Viewer',
                email: viewerEmail,
                password: 'Viewer@1234',
                role: 'viewer'
            });
            await viewer.save();
            console.log('✅ Sample viewer user created:', viewerEmail);
        }

    } catch (error) {
        console.error('❌ Error seeding sample users:', error.message);
    }
}

module.exports = {
    seedAdminUser,
    seedSampleUsers
};
