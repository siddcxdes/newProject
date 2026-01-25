import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Sub-schemas used by the main user schema.
// These keep the persisted shape stable while still allowing future extension.
const streakSchema = new mongoose.Schema(
  {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActivityDate: { type: Date, default: null }
  },
  { _id: false }
);

const statsSchema = new mongoose.Schema(
  {
    totalActivities: { type: Number, default: 0 },
    totalXP: { type: Number, default: 0 }
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    theme: { type: String, default: 'dark' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    notificationsEnabled: { type: Boolean, default: true },
    dailyDsaGoal: { type: Number, default: 3 },
    weeklyGymGoal: { type: Number, default: 5 },
    dailyCalorieGoal: { type: Number, default: 2200 },
    dailyProteinGoal: { type: Number, default: 160 },
    timedTasks: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { _id: false, strict: false }
);

const journeySchema = new mongoose.Schema(
  {
    startedAt: { type: Date, default: Date.now },
    lastCheckInAt: { type: Date, default: null }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, default: 'Champion', trim: true },
  avatar: { type: String, default: '' },
  quote: { type: String, default: "The only way to do great work is to love what you do." },

  // Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Progress + state (this is what the frontend expects to persist across refresh/device)
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  xpToNextLevel: { type: Number, default: 500 },

  streak: { type: streakSchema, default: () => ({}) },
  stats: { type: statsSchema, default: () => ({}) },
  settings: { type: settingsSchema, default: () => ({}) },
  journey: { type: journeySchema, default: () => ({}) },

  // Persisted “content state” (kept flexible to match current UI needs)
  learningDomains: { type: [mongoose.Schema.Types.Mixed], default: [] },
  recipes: { type: [mongoose.Schema.Types.Mixed], default: [] },
  dsaTopics: { type: [mongoose.Schema.Types.Mixed], default: [] },
  aiModules: { type: [mongoose.Schema.Types.Mixed], default: [] },
  workouts: { type: [mongoose.Schema.Types.Mixed], default: [] },
  goals: { type: [mongoose.Schema.Types.Mixed], default: [] },
  dailyTasks: { type: mongoose.Schema.Types.Mixed, default: {} },
  nutritionLogs: { type: mongoose.Schema.Types.Mixed, default: {} },
  heatmapData: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });


// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  // If a legacy/broken user record exists without a password hash, bcrypt will throw.
  // Treat it as invalid credentials instead of crashing the route.
  if (!candidatePassword || !this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate level from XP
userSchema.methods.calculateLevel = function () {
  const xp = this.xp;
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
userSchema.methods.updateStreak = function (activityDateStr) {
  const today = activityDateStr || new Date().toISOString().split('T')[0];
  const lastDate = this.streak.lastActivityDate ? this.streak.lastActivityDate.toISOString().split('T')[0] : null;

  if (!lastDate) {
    this.streak.current = 1;
    this.streak.longest = 1;
  } else if (lastDate === today) {
    return; // Already logged today
  } else {
    const last = new Date(lastDate);
    const curr = new Date(today);
    const diffDays = Math.floor((curr - last) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      this.streak.current += 1;
      this.streak.longest = Math.max(this.streak.longest, this.streak.current);
    } else if (diffDays > 1) {
      this.streak.current = 1;
    }
  }
  this.streak.lastActivityDate = new Date(today);
};

// Check for level up after XP gain
userSchema.methods.checkLevelUp = function () {
  const oldLevel = this.level;
  this.level = this.calculateLevel();
  return this.level - oldLevel;
};

// Sanitize output (remove password)
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

export default mongoose.model('User', userSchema);
