// XP values for different activities
export const XP_VALUES = {
    dsa: { easy: 10, medium: 25, hard: 50 },
    ai: 30,
    gym: 20,
    job: 15,
    personal: 10
};

// Calculate XP needed to reach a level
export const getXpForLevel = (level) => {
    if (level <= 1) return 0;
    return Math.floor(500 * Math.pow(1.5, level - 2)) + getXpForLevel(level - 1);
};

// Calculate progress percentage to next level
export const getLevelProgress = (currentXp, currentLevel) => {
    const currentLevelXp = getXpForLevel(currentLevel);
    const nextLevelXp = getXpForLevel(currentLevel + 1);
    const xpInCurrentLevel = currentXp - currentLevelXp;
    const xpNeeded = nextLevelXp - currentLevelXp;
    return Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeeded) * 100));
};

// Format XP number
export const formatXp = (xp) => {
    if (xp >= 1000000) {
        return `${(xp / 1000000).toFixed(1)}M`;
    }
    if (xp >= 1000) {
        return `${(xp / 1000).toFixed(1)}K`;
    }
    return xp.toString();
};
