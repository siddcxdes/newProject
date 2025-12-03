import { z } from 'zod';

// DSA Problem Validation
export const DSAProblemSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string()
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title must be less than 200 characters')
        .trim()
        .refine(val => !/^[a-z]+$/.test(val), 'Please enter a valid problem title'),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    topic: z.string()
        .min(2, 'Topic must be at least 2 characters')
        .max(50, 'Topic must be less than 50 characters')
        .trim(),
    link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    solvedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
    needsRevision: z.boolean().default(false),
    nextRevisionDate: z.string().optional(),
});

// AI Module Validation
export const AIModuleSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string()
        .min(3, 'Module name must be at least 3 characters')
        .max(100, 'Module name must be less than 100 characters')
        .trim()
        .refine(val => !/^[a-z]+$/.test(val), 'Please enter a valid module name'),
    category: z.string()
        .min(2, 'Category must be at least 2 characters')
        .max(50, 'Category must be less than 50 characters')
        .trim(),
    progress: z.number()
        .min(0, 'Progress must be at least 0')
        .max(100, 'Progress cannot exceed 100'),
    timeSpent: z.number()
        .min(0, 'Time spent cannot be negative')
        .max(10000, 'Time spent seems unrealistic'),
    completedDate: z.string().optional(),
    notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
    concepts: z.array(z.string()).default([]),
    projects: z.array(z.string()).default([]),
});

// Gym Session Validation
export const GymSessionSchema = z.object({
    id: z.string().uuid().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    duration: z.number()
        .min(1, 'Duration must be at least 1 minute')
        .max(300, 'Duration seems unrealistic')
        .optional(),
    feeling: z.number()
        .min(1, 'Feeling must be between 1-5')
        .max(5, 'Feeling must be between 1-5')
        .optional(),
    notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
    isRestDay: z.boolean().default(false),
});

// Personal Goal Validation
export const PersonalGoalSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string()
        .min(3, 'Goal name must be at least 3 characters')
        .max(200, 'Goal name must be less than 200 characters')
        .trim()
        .refine(val => !/^[a-z]+$/.test(val), 'Please enter a valid goal name'),
    targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    progress: z.number()
        .min(0, 'Progress must be at least 0')
        .max(100, 'Progress cannot exceed 100'),
    milestones: z.array(z.object({
        id: z.string(),
        name: z.string().min(1, 'Milestone name is required'),
        completed: z.boolean(),
    })).default([]),
});

// Job Application Validation
export const JobApplicationSchema = z.object({
    id: z.string().uuid().optional(),
    company: z.string()
        .min(2, 'Company name must be at least 2 characters')
        .max(100, 'Company name must be less than 100 characters')
        .trim()
        .refine(val => !/^[a-z]+$/.test(val), 'Please enter a valid company name'),
    role: z.string()
        .min(3, 'Role must be at least 3 characters')
        .max(100, 'Role must be less than 100 characters')
        .trim(),
    salaryRange: z.string().max(50, 'Salary range must be less than 50 characters'),
    status: z.enum(['Saved', 'Applied', 'Interview Scheduled', 'Offer', 'Rejected']),
    applicationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    statusHistory: z.array(z.object({
        status: z.enum(['Saved', 'Applied', 'Interview Scheduled', 'Offer', 'Rejected']),
        date: z.string(),
    })).default([]),
    interviewPrep: z.array(z.object({
        id: z.string(),
        task: z.string(),
        completed: z.boolean(),
    })).default([]),
    skillsGap: z.array(z.string()).default([]),
    notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

// Daily Check-in Validation
export const DailyCheckInSchema = z.object({
    id: z.string().uuid().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    morningPriorities: z.array(z.string().min(3, 'Priority must be at least 3 characters')).max(3, 'Maximum 3 priorities'),
    eveningReflection: z.object({
        wentWell: z.string().max(500, 'Reflection must be less than 500 characters').optional(),
        blockers: z.string().max(500, 'Blockers must be less than 500 characters').optional(),
        energyLevel: z.number().min(1).max(5).optional(),
        productivityScore: z.number().min(0).max(100).optional(),
    }).optional(),
});

// User Profile Validation
export const UserProfileSchema = z.object({
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters')
        .trim()
        .refine(val => !/^[a-z]+$/.test(val), 'Please enter a valid name'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    dailyGoals: z.object({
        dsa: z.number().min(1, 'DSA goal must be at least 1').max(20, 'DSA goal seems unrealistic'),
        aiLearning: z.number().min(0.5, 'AI learning goal must be at least 0.5 hours').max(12, 'AI learning goal seems unrealistic'),
        gym: z.number().min(1, 'Gym goal must be at least 1 day').max(7, 'Gym goal cannot exceed 7 days'),
    }),
    theme: z.enum(['light', 'dark']).default('dark'),
});

// Helper function to validate and sanitize data
export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    } else {
        const errors = result.error.issues.map((issue: z.ZodIssue) => `${issue.path.join('.')}: ${issue.message}`);
        return { success: false, errors };
    }
}

// Export types
export type DSAProblem = z.infer<typeof DSAProblemSchema>;
export type AIModule = z.infer<typeof AIModuleSchema>;
export type GymSession = z.infer<typeof GymSessionSchema>;
export type PersonalGoal = z.infer<typeof PersonalGoalSchema>;
export type JobApplication = z.infer<typeof JobApplicationSchema>;
export type DailyCheckIn = z.infer<typeof DailyCheckInSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
