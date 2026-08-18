import mongoose from 'mongoose'
// Define the User schema for MongoDB using Mongoose
const userSchema = new mongoose.Schema(
  {
    // Define the fields for the User model
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 32,
      trim: true,
    },

    // email address of the user
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    // passwordHash field to store hashed passwords. Only present for accounts
    // created with a password (authProvider 'local'); Google accounts have none.
    passwordHash: {
      type: String,
      required: false,
      default: null,
    },

    // How the account was created.
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    // Google account identifier. Sparse so local users are unaffected by the
    // unique index.
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },

    // email verification status
    emailVerified: {
      type: Boolean,
      default: false,
    },
    // email verification token hash
    emailVerificationTokenHash: {
      type: String,
      default: null,
    },
    // email verification token expiration date
    emailVerificationTokenExpires: {
      type: Date,
      default: null,
    },

    // password reset token hash
    resetPasswordTokenHash: {
      type: String,
      default: null,
    },
    // password reset token expiration date
    resetPasswordTokenExpires: {
      type: Date,
      default: null,
    },
    // Define the role field with allowed values and a default
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true },
)

export const User = mongoose.model('User', userSchema)
