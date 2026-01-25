// Notification Manager for scheduled tasks
class NotificationManager {
    constructor() {
        this.permission = 'default';
        this.checkInterval = null;
        this.notifiedTasks = new Set(); // Track which tasks we've already notified about
    }

    // Request notification permission
    async requestPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            this.permission = 'granted';
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission === 'granted';
        }

        return false;
    }

    // Show a notification
    showNotification(title, options = {}) {
        if (this.permission !== 'granted') return;

        const notification = new Notification(title, {
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: [200, 100, 200],
            requireInteraction: false,
            ...options
        });

        // Auto-close after 10 seconds
        setTimeout(() => notification.close(), 10000);

        return notification;
    }

    // Check for upcoming tasks and send notifications
    checkScheduledTasks(activities) {
        if (this.permission !== 'granted') return;

        const now = new Date();
        const fifteenMinutes = 15 * 60 * 1000;

        activities.forEach(activity => {
            if (!activity.scheduledTime || activity.completed) return;

            const scheduled = new Date(activity.scheduledTime);
            const timeUntil = scheduled - now;
            const taskKey = `${activity._id}-${activity.scheduledTime}`;

            // Task is overdue
            if (timeUntil < 0 && !this.notifiedTasks.has(`${taskKey}-overdue`)) {
                this.showNotification('⚠️ Task Overdue!', {
                    body: `${activity.details?.notes || activity.type.toUpperCase()} is overdue! Complete it now to minimize XP penalty.`,
                    tag: taskKey,
                    requireInteraction: true
                });
                this.notifiedTasks.add(`${taskKey}-overdue`);
            }
            // Task is coming up in 15 minutes
            else if (timeUntil > 0 && timeUntil <= fifteenMinutes && !this.notifiedTasks.has(`${taskKey}-reminder`)) {
                const minutes = Math.floor(timeUntil / 60000);
                this.showNotification('⏰ Task Reminder', {
                    body: `${activity.details?.notes || activity.type.toUpperCase()} is scheduled in ${minutes} minutes!`,
                    tag: taskKey
                });
                this.notifiedTasks.add(`${taskKey}-reminder`);
            }
        });

        // Clean up old notifications from memory (older than 24 hours)
        const oneDayAgo = now - (24 * 60 * 60 * 1000);
        activities.forEach(activity => {
            if (activity.scheduledTime && new Date(activity.scheduledTime) < oneDayAgo) {
                const taskKey = `${activity._id}-${activity.scheduledTime}`;
                this.notifiedTasks.delete(`${taskKey}-reminder`);
                this.notifiedTasks.delete(`${taskKey}-overdue`);
            }
        });
    }

    // Start checking for tasks every minute
    startMonitoring(getActivities) {
        if (this.checkInterval) return; // Already monitoring

        // Check immediately
        this.checkScheduledTasks(getActivities());

        // Then check every minute
        this.checkInterval = setInterval(() => {
            this.checkScheduledTasks(getActivities());
        }, 60000); // 60 seconds

        console.log('✅ Notification monitoring started');
    }

    // Stop monitoring
    stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log('⏹️ Notification monitoring stopped');
        }
    }

    // Clear notification history for a specific task
    clearTaskNotifications(taskId) {
        this.notifiedTasks.forEach(key => {
            if (key.startsWith(taskId)) {
                this.notifiedTasks.delete(key);
            }
        });
    }
}

// Create singleton instance
const notificationManager = new NotificationManager();

export default notificationManager;
