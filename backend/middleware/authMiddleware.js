import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'dev_jwt_secret_key_12345';
      const decoded = jwt.verify(token, secret);

      // Try fetching updated user from DB if available
      try {
        req.user = await User.findById(decoded.id).select('-password');
      } catch (err) {
        req.user = decoded;
      }

      if (!req.user) {
        req.user = decoded;
      }

      return next();
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && (req.user.isAdmin || req.user.isSuperAdmin)) {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Not authorized as an admin' });
  }
};

export const superAdmin = (req, res, next) => {
  if (req.user && req.user.isSuperAdmin) {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Not authorized as a super admin' });
  }
};
