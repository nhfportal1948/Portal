import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-dev-jwt-key';

/**
 * Generates a JWT token for a user.
 * @param {Object} user - User object containing id, email, role, linkedSchoolId, and linkedStudentId.
 * @returns {string} Signed JWT token
 */
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      linkedSchoolId: user.linkedSchoolId,
      linkedStudentId: user.linkedStudentId,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Middleware to authenticate a JWT token from authorization header.
 */
export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token is missing or invalid. Use format: Bearer <token>' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token is invalid or has expired.' });
  }
}

/**
 * Middleware to check if the authenticated user has one of the allowed roles.
 * @param {...string} roles - List of roles permitted to access the resource.
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication is required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Role: ${req.user.role} does not have permission.` });
    }

    next();
  };
}
