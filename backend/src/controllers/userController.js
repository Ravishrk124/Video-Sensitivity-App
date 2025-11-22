// backend/src/controllers/userController.js
const User = require('../models/User');
const Video = require('../models/Video');

/**
 * Get all users (Admin only)
 */
async function getAllUsers(req, res) {
    try {
        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
}

/**
 * Delete user (Admin only)
 * Cannot delete self
 */
async function deleteUser(req, res) {
    try {
        const { id } = req.params;

        // Prevent admin from deleting themselves
        if (String(req.user._id) === String(id)) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete all videos owned by this user
        await Video.deleteMany({ owner: id });

        // Delete user
        await User.findByIdAndDelete(id);

        res.json({
            ok: true,
            message: `User ${user.email} and their videos have been deleted`
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
}

/**
 * Get user statistics (Admin only)
 */
async function getUserStats(req, res) {
    try {
        const totalUsers = await User.countDocuments();
        const adminCount = await User.countDocuments({ role: 'admin' });
        const editorCount = await User.countDocuments({ role: 'editor' });
        const viewerCount = await User.countDocuments({ role: 'viewer' });

        res.json({
            total: totalUsers,
            byRole: {
                admin: adminCount,
                editor: editorCount,
                viewer: viewerCount
            }
        });

    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ message: 'Failed to get statistics', error: error.message });
    }
}

module.exports = {
    getAllUsers,
    deleteUser,
    getUserStats
};
