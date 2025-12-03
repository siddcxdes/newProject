export const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

export const showNotification = (title: string, options?: NotificationOptions): void => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return;
    }

    if (Notification.permission === 'granted') {
        new Notification(title, {
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            ...options,
        });
    }
};

export const scheduleNotification = (
    title: string,
    body: string,
    time: string // HH:MM format
): void => {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
        showNotification(title, { body });
    }, delay);
};

export const showStreakWarning = (currentStreak: number): void => {
    showNotification('⚠️ Streak Warning!', {
        body: `Your ${currentStreak}-day streak is about to break! Log today's progress now.`,
        tag: 'streak-warning',
        requireInteraction: true,
    });
};

export const showMilestone = (milestone: string): void => {
    showNotification('🎉 Milestone Achieved!', {
        body: milestone,
        tag: 'milestone',
    });
};

export const showDailyReminder = (): void => {
    showNotification('Good Morning! 🌅', {
        body: "Time to check in and set today's priorities!",
        tag: 'daily-reminder',
    });
};

export const showEveningReview = (): void => {
    showNotification('Evening Review 🌙', {
        body: "Take a moment to reflect on today's progress.",
        tag: 'evening-review',
    });
};

export const showMotivational = (message: string): void => {
    showNotification('💪 Keep Going!', {
        body: message,
        tag: 'motivational',
    });
};
