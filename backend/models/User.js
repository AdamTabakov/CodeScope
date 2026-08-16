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
    // Define the email field with validation and constraints
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Define the passwordHash field to store hashed passwords
    passwordHash: {
      type: String,
      required: true,
    },
    // Email verification status. New accounts start unverified until they
    // follow the link sent to their inbox. Stored as a hash so a database
    // leak cannot be replayed to verify an account.
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationTokenHash: {
      type: String,
      default: null,
    },
    emailVerificationTokenExpires: {
      type: Date,
      default: null,
    },
    // Password reset flow. Works like email verification: only a SHA-256 hash
    // of the emailed token is stored, and it expires after a short window.
    resetPasswordTokenHash: {
      type: String,
      default: null,
    },
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
