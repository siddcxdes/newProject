// Time utility functions for scheduled tasks

export const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

export const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) {
        return `Today at ${formatTime(dateString)}`;
    } else if (isTomorrow) {
        return `Tomorrow at ${formatTime(dateString)}`;
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};

export const isOverdue = (scheduledTime) => {
    if (!scheduledTime) return false;
    return new Date() > new Date(scheduledTime);
};

export const getTimeUntil = (scheduledTime) => {
    if (!scheduledTime) return null;

    const now = new Date();
    const scheduled = new Date(scheduledTime);
    const diff = scheduled - now;

    if (diff < 0) return { overdue: true, text: 'Overdue' };

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return { overdue: false, text: `${days}d ${hours % 24}h` };
    if (hours > 0) return { overdue: false, text: `${hours}h ${minutes % 60}m` };
    if (minutes > 0) return { overdue: false, text: `${minutes}m` };

    return { overdue: false, text: 'Soon' };
};

export const getTimeStatus = (scheduledTime) => {
    if (!scheduledTime) return 'none';

    const now = new Date();
    const scheduled = new Date(scheduledTime);
    const diff = scheduled - now;

    if (diff < 0) return 'overdue';
    if (diff < 15 * 60 * 1000) return 'urgent'; // Less than 15 minutes
    if (diff < 60 * 60 * 1000) return 'soon'; // Less than 1 hour

    return 'upcoming';
};
