import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['dsa', 'ai', 'gym', 'job', 'personal'],
        required: true
    },
    xpEarned: {
        type: Number,
        required: true
    },
    details: {
        difficulty: String,  // For DSA: easy, medium, hard
        moduleName: String,  // For AI
        notes: String        // General notes
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
activitySchema.index({ userId: 1, date: -1 });
activitySchema.index({ userId: 1, type: 1, date: -1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
