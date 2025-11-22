// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roles');
const userController = require('../controllers/userController');

// All user management routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// GET /api/users - List all users
router.get('/', userController.getAllUsers);

// GET /api/users/stats - Get user statistics
router.get('/stats', userController.getUserStats);

// DELETE /api/users/:id - Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;
