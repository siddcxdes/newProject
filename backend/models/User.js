import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, default: 'Champion', trim: true },
  avatar: { type: String, default: '' },
  quote: { type: String, default: "The only way to do great work is to love what you do." },
  
  // Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Gamification
  stats: {
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null }
  },
  
  // User Settings
  settings: {
    weeklyGymGoal: { type: Number, default: 6 },
    dailyDsaGoal: { type: Number, default: 3 },
    theme: { type: String, default: 'dark' },
    notifications: { type: Boolean, default: true }
  },
  
  // Journey tracking
  journey: {
    startDate: { type: Date, default: Date.now },
    totalWeeks: { type: Number, default: 17 },
    currentWeek: { type: Number, default: 1 }
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate level from XP
userSchema.methods.calculateLevel = function() {
  const xp = this.stats.xp;
  if (xp < 100) return 1;
  if (xp < 300) return 2;
  if (xp < 600) return 3;
  if (xp < 1000) return 4;
  if (xp < 1500) return 5;
  if (xp < 2100) return 6;
  if (xp < 2800) return 7;
  if (xp < 3600) return 8;
  if (xp < 4500) return 9;
  return 10;
};

// Update streak based on activity
userSchema.methods.updateStreak = function(activityDateStr) {
  const today = activityDateStr || new Date().toISOString().split('T')[0];
  const lastDate = this.stats.lastActiveDate ? this.stats.lastActiveDate.toISOString().split('T')[0] : null;

  if (!lastDate) {
    this.stats.currentStreak = 1;
    this.stats.longestStreak = 1;
  } else if (lastDate === today) {
    return; // Already logged today
  } else {
    const last = new Date(lastDate);
    const curr = new Date(today);
    const diffDays = Math.floor((curr - last) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      this.stats.currentStreak += 1;
      this.stats.longestStreak = Math.max(this.stats.longestStreak, this.stats.currentStreak);
    } else if (diffDays > 1) {
      this.stats.currentStreak = 1;
    }
  }
  this.stats.lastActiveDate = new Date(today);
};

// Check for level up after XP gain
userSchema.methods.checkLevelUp = function() {
  const oldLevel = this.stats.level;
  this.stats.level = this.calculateLevel();
  return this.stats.level - oldLevel;
};

// Sanitize output (remove password)
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

export default mongoose.model('User', userSchema);
