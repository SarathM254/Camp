import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const SUPER_ADMIN_EMAIL = 'motupallisarathchandra@gmail.com';

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret_key_12345';
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      avatarSeed: user.avatarSeed || null,
      isSuperAdmin: user.isSuperAdmin || false,
      isAdmin: user.isAdmin || false,
    },
    secret,
    { expiresIn: '30d' }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isSuperAdmin = cleanEmail === SUPER_ADMIN_EMAIL;

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      authProvider: 'email',
      isSuperAdmin,
      isAdmin: isSuperAdmin,
      lastLogin: new Date(),
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
        isAdmin: user.isAdmin,
        isCollegeVerified: user.isCollegeVerified || false,
        authProvider: user.authProvider,
        avatarSeed: user.avatarSeed || null,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ success: false, error: 'This email address is not registered.' });
    }

    if (!user.password) {
      return res.status(400).json({ success: false, error: 'Please sign in using Google OAuth.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    // Auto grant super admin if email matches
    if (cleanEmail === SUPER_ADMIN_EMAIL && !user.isSuperAdmin) {
      user.isSuperAdmin = true;
      user.isAdmin = true;
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
        isAdmin: user.isAdmin,
        isCollegeVerified: user.isCollegeVerified || false,
        authProvider: user.authProvider,
        avatarSeed: user.avatarSeed || null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Server error during login' });
  }
};

// @desc    Google OAuth Login/Register
// @route   POST /api/auth/google
export const googleAuth = async (req, res) => {
  try {
    const { idToken, credential } = req.body;
    const tokenToVerify = idToken || credential;

    if (!tokenToVerify) {
      return res.status(400).json({ success: false, error: 'Google ID token is required' });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const client = new OAuth2Client(googleClientId);

    const ticket = await client.verifyIdToken({
      idToken: tokenToVerify,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    const googleEmail = payload.email.toLowerCase().trim();
    const googleName = payload.name || googleEmail.split('@')[0];
    const googleId = payload.sub;
    const googlePicture = payload.picture;

    const isSuperAdminEmail = googleEmail === SUPER_ADMIN_EMAIL;

    let user = await User.findOne({ email: googleEmail });

    if (user) {
      user.googleId = googleId;
      user.googlePicture = googlePicture;
      user.lastLogin = new Date();
      if (isSuperAdminEmail) {
        user.isSuperAdmin = true;
        user.isAdmin = true;
      }
      if (googleEmail.endsWith('@iitism.ac.in')) {
        user.isCollegeVerified = true;
        user.collegeEmail = googleEmail;
        user.admissionNumber = googleEmail.split('@')[0];
      }
      await user.save();
    } else {
      user = await User.create({
        name: googleName,
        email: googleEmail,
        googleId,
        googlePicture,
        authProvider: 'google',
        isSuperAdmin: isSuperAdminEmail,
        isAdmin: isSuperAdminEmail,
        isCollegeVerified: googleEmail.endsWith('@iitism.ac.in'),
        collegeEmail: googleEmail.endsWith('@iitism.ac.in') ? googleEmail : null,
        admissionNumber: googleEmail.endsWith('@iitism.ac.in') ? googleEmail.split('@')[0] : null,
        lastLogin: new Date(),
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        googlePicture: user.googlePicture,
        isSuperAdmin: user.isSuperAdmin,
        isAdmin: user.isAdmin,
        isCollegeVerified: user.isCollegeVerified || false,
        authProvider: user.authProvider,
        avatarSeed: user.avatarSeed || null,
      },
    });
  } catch (error) {
    console.error('Google Auth error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Google authentication failed' });
  }
};

// @desc    Get current user profile / status
// @route   GET /api/auth/me (or /api/auth/status)
export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(200).json({ success: true, authenticated: false, user: null });
    }

    const user = req.user;
    return res.json({
      success: true,
      authenticated: true,
      user: {
        id: user._id ? user._id.toString() : user.id,
        name: user.name,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin || false,
        isAdmin: user.isAdmin || false,
        isCollegeVerified: user.isCollegeVerified || false,
        googlePicture: user.googlePicture || null,
        authProvider: user.authProvider || 'email',
        avatarSeed: user.avatarSeed || null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message || 'Server error fetching user profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, avatarSeed } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.name = name.trim();
    if (avatarSeed !== undefined) {
      user.avatarSeed = avatarSeed;
    }

    await user.save();
    const token = generateToken(user);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
        isAdmin: user.isAdmin,
        isCollegeVerified: user.isCollegeVerified || false,
        googlePicture: user.googlePicture || null,
        authProvider: user.authProvider || 'email',
        avatarSeed: user.avatarSeed || null,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Server error updating profile' });
  }
};
