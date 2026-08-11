import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

export const verifyCollegeEmail = async (req, res) => {
  try {
    const { googleToken } = req.body;
    if (!googleToken) {
      return res.status(400).json({ success: false, error: 'Google token required' });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const client = new OAuth2Client(googleClientId);

    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    const googleEmail = payload.email.toLowerCase().trim();

    if (!googleEmail.endsWith('@iitism.ac.in')) {
      return res.status(400).json({ success: false, error: 'Must use an @iitism.ac.in email address' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.isCollegeVerified = true;
    user.collegeEmail = googleEmail;
    user.admissionNumber = googleEmail.split('@')[0];
    await user.save();

    return res.json({ success: true, user });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Verification failed' });
  }
};
