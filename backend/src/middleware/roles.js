// backend/src/middleware/roles.js

/**
 * Role-based access control middleware
 */

/**
 * Require admin role
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
}

/**
 * Require editor or admin role
 */
function requireEditor(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!['editor', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Editor or Admin access required' });
  }

  next();
}

/**
 * Require any authenticated user (viewer, editor, or admin)
 */
function requireViewer(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  next();
}

/**
 * Check if user is owner of resource or admin
 * Use this as a utility function, not middleware
 */
function isOwnerOrAdmin(user, resourceOwnerId) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return String(user._id) === String(resourceOwnerId);
}

module.exports = {
  requireAdmin,
  requireEditor,
  requireViewer,
  isOwnerOrAdmin
};
