import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      default: null,
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      default: null,
    },
    googlePicture: {
      type: String,
      default: null,
    },
    authProvider: {
      type: String,
      enum: ['email', 'google'],
      default: 'email',
    },
    avatarSeed: {
      type: String,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isCollegeVerified: {
      type: Boolean,
      default: false,
    },
    admissionNumber: {
      type: String,
      default: null,
      trim: true,
    },
    collegeEmail: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
