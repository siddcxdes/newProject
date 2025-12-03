import { AppState } from '@/types';
import { loadState, saveState, createBackup } from './storage';
import { validateAndSanitize, DSAProblemSchema, AIModuleSchema, GymSessionSchema, PersonalGoalSchema, JobApplicationSchema, UserProfileSchema } from './validation';

/**
 * Data Migration Utility
 * Cleans and validates existing data, removes test/garbage entries
 */

// Check if a string looks like garbage/test data
function isGarbageText(text: string): boolean {
    if (!text || text.trim().length === 0) return true;

    // Check for random keyboard mashing (e.g., "jislsdfsd", "oasdjfajsdf")
    const hasRepeatingChars = /(.)\1{3,}/.test(text); // Same char 4+ times
    const hasNoVowels = !/[aeiouAEIOU]/.test(text) && text.length > 5;
    const isAllLowerNoSpaces = /^[a-z]+$/.test(text) && text.length > 10;
    const hasRandomPattern = /^[a-z]{8,}$/.test(text); // Long string of only lowercase

    return hasRepeatingChars || hasNoVowels || isAllLowerNoSpaces || hasRandomPattern;
}

// Clean and validate DSA problems
function cleanDSAProblems(problems: any[]): any[] {
    return problems.filter(problem => {
        // Remove if title is garbage
        if (isGarbageText(problem.title)) return false;

        // Validate with schema
        const result = validateAndSanitize(DSAProblemSchema, problem);
        return result.success;
    });
}

// Clean and validate AI modules
function cleanAIModules(modules: any[]): any[] {
    return modules.filter(module => {
        // Remove if name is garbage
        if (isGarbageText(module.name)) return false;

        // Validate with schema
        const result = validateAndSanitize(AIModuleSchema, module);
        return result.success;
    });
}

// Clean and validate gym sessions
function cleanGymSessions(sessions: any[]): any[] {
    return sessions.filter(session => {
        // Validate with schema
        const result = validateAndSanitize(GymSessionSchema, session);
        return result.success;
    });
}

// Clean and validate personal goals
function cleanPersonalGoals(goals: any[]): any[] {
    return goals.filter(goal => {
        // Remove if name is garbage
        if (isGarbageText(goal.name)) return false;

        // Validate with schema
        const result = validateAndSanitize(PersonalGoalSchema, goal);
        return result.success;
    });
}

// Clean and validate job applications
function cleanJobApplications(applications: any[]): any[] {
    return applications.filter(app => {
        // Remove if company or role is garbage
        if (isGarbageText(app.company) || isGarbageText(app.role)) return false;

        // Validate with schema
        const result = validateAndSanitize(JobApplicationSchema, app);
        return result.success;
    });
}

// Main migration function
export function migrateAndCleanData(): { success: boolean; cleaned: number; errors: string[] } {
    try {
        // Load current state
        const currentState = loadState();

        // Create backup before migration
        createBackup(currentState);

        // Track cleaned items
        let cleanedCount = 0;
        const errors: string[] = [];

        // Clean each data type
        const originalDSACount = currentState.dsaProblems.length;
        const cleanedDSA = cleanDSAProblems(currentState.dsaProblems);
        cleanedCount += originalDSACount - cleanedDSA.length;

        const originalAICount = currentState.aiModules.length;
        const cleanedAI = cleanAIModules(currentState.aiModules);
        cleanedCount += originalAICount - cleanedAI.length;

        const originalGymCount = currentState.gymSessions.length;
        const cleanedGym = cleanGymSessions(currentState.gymSessions);
        cleanedCount += originalGymCount - cleanedGym.length;

        const originalGoalsCount = currentState.personalGoals.length;
        const cleanedGoals = cleanPersonalGoals(currentState.personalGoals);
        cleanedCount += originalGoalsCount - cleanedGoals.length;

        const originalJobsCount = currentState.jobApplications.length;
        const cleanedJobs = cleanJobApplications(currentState.jobApplications);
        cleanedCount += originalJobsCount - cleanedJobs.length;

        // Validate and clean profile
        const profileResult = validateAndSanitize(UserProfileSchema, currentState.profile);
        if (!profileResult.success) {
            errors.push(...profileResult.errors);
        }

        // Create cleaned state
        const cleanedState: AppState = {
            ...currentState,
            dsaProblems: cleanedDSA,
            aiModules: cleanedAI,
            gymSessions: cleanedGym,
            personalGoals: cleanedGoals,
            jobApplications: cleanedJobs,
            profile: profileResult.success ? profileResult.data : currentState.profile,
        };

        // Save cleaned state
        saveState(cleanedState);

        return {
            success: true,
            cleaned: cleanedCount,
            errors,
        };
    } catch (error) {
        return {
            success: false,
            cleaned: 0,
            errors: [error instanceof Error ? error.message : 'Unknown error during migration'],
        };
    }
}

// Check if migration is needed
export function needsMigration(): boolean {
    const state = loadState();

    // Check for garbage data
    const hasGarbageDSA = state.dsaProblems.some(p => isGarbageText(p.title));
    const hasGarbageAI = state.aiModules.some(m => isGarbageText(m.name));
    const hasGarbageGoals = state.personalGoals.some(g => isGarbageText(g.name));
    const hasGarbageJobs = state.jobApplications.some(j => isGarbageText(j.company) || isGarbageText(j.role));

    return hasGarbageDSA || hasGarbageAI || hasGarbageGoals || hasGarbageJobs;
}
