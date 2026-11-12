const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema(
  {
    // Public-facing Employee ID (e.g. EMP001)
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    initials: {
      type: String,
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
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      default: '',
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    joiningDate: {
      type: String,
      default: '',
    },
    accountStatus: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    avatar: {
      type: String,
      default: '',
    },
    dateOfBirth: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    reportingManager: {
      type: String,
      default: '',
    },
    projectRole: {
      type: String,
      default: '',
    },
    currentTaskCount: {
      type: Number,
      default: 0,
    },
    assignedProjects: {
      type: [String],
      default: [],
    },
    unreadNotifications: {
      type: Number,
      default: 0,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Auto-compute initials before saving
employeeSchema.pre('save', async function (next) {
  // Initials
  if (this.isModified('name') || !this.initials) {
    const parts = this.name.trim().split(/\s+/).filter(Boolean);
    this.initials = (
      parts.length >= 2
        ? parts[0][0] + parts[parts.length - 1][0]
        : this.name.substring(0, 2)
    ).toUpperCase();
  }

  // Hash password
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

// Compare plain password with stored hash
employeeSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Return safe profile
employeeSchema.methods.toProfile = function () {
  const obj = this.toObject();
  delete obj.password;
  obj.id = obj._id.toString();
  return obj;
};

module.exports = mongoose.model('Employee', employeeSchema);

