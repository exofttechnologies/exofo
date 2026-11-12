const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [4, 'Password must be at least 4 characters'],
      select: false, // never return password by default
    },
    designation: {
      type: String,
      default: 'Administrator',
    },
    company: {
      type: String,
      default: 'Exofo',
    },
    phone: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['admin', 'superadmin'],
      default: 'admin',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    unreadNotifications: {
      type: Number,
      default: 0,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare plain password with hash
adminSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Return safe profile (no password)
adminSchema.methods.toProfile = function () {
  const obj = this.toObject();
  delete obj.password;
  obj.id = obj._id.toString();
  obj.initials = obj.name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  obj.accountCreatedAt = obj.createdAt;
  return obj;
};

module.exports = mongoose.model('Admin', adminSchema);

