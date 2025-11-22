require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function resetAdmin() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected');

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@1234';

        console.log(`Resetting admin user: ${adminEmail}`);

        // Delete existing admin
        await User.deleteOne({ email: adminEmail });
        console.log('🗑️  Deleted existing admin user');

        // Create new admin
        const admin = new User({
            name: 'Administrator',
            email: adminEmail,
            password: adminPassword,
            role: 'admin'
        });

        await admin.save();
        console.log('✨ Created new admin user');
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 Password: ${adminPassword}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

resetAdmin();
