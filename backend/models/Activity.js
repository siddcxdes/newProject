import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['dsa', 'ai', 'gym', 'job', 'personal'], required: true },
  xpEarned: { type: Number, required: true, default: 0 },
  dateString: { type: String, required: true, index: true },
  details: {
    problemName: String,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    topicId: mongoose.Schema.Types.ObjectId,
    moduleName: String,
    lessonName: String,
    moduleId: mongoose.Schema.Types.ObjectId,
    workoutId: mongoose.Schema.Types.ObjectId,
    workoutName: String,
    company: String,
    position: String,
    notes: String
  }
}, { timestamps: true });

activitySchema.index({ userId: 1, dateString: -1 });
activitySchema.index({ userId: 1, type: 1, dateString: -1 });

export default mongoose.model('Activity', activitySchema);
