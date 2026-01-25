// IST Timezone utilities
const IST_OFFSET = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds

// Get current date in IST
export const getISTDate = () => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    return new Date(utc + IST_OFFSET);
};

// Get date string in IST (YYYY-MM-DD format)
export const getISTDateString = (date = new Date()) => {
    const utc = date.getTime() + (date.getTimezoneOffset() * 60 * 1000);
    const istDate = new Date(utc + IST_OFFSET);
    return istDate.toISOString().split('T')[0];
};

// Get today's date string in IST
export const getTodayIST = () => getISTDateString();

// Get time-based greeting (IST)
export const getGreeting = () => {
    const istDate = getISTDate();
    const hour = istDate.getHours();

    if (hour >= 5 && hour < 12) {
        return { text: 'Good Morning', emoji: '' };
    } else if (hour >= 12 && hour < 17) {
        return { text: 'Good Afternoon', emoji: '☀️' };
    } else if (hour >= 17 && hour < 21) {
        return { text: 'Good Evening', emoji: '' };
    } else {
        return { text: 'Good Night', emoji: '' };
    }
};

// Format date for display (using IST)
export const formatDate = (date = new Date()) => {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
    };
    return date.toLocaleDateString('en-IN', options);
};

// Format time for display (using IST)
export const formatTime = (date = new Date()) => {
    return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
    });
};

// Get day of week in IST (0 = Sunday, 1 = Monday, ... 6 = Saturday)
export const getISTDayOfWeek = (date = new Date()) => {
    const utc = date.getTime() + (date.getTimezoneOffset() * 60 * 1000);
    const istDate = new Date(utc + IST_OFFSET);
    return istDate.getDay();
};

// Get day difference
export const getDaysDiff = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(d2 - d1);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// Get week number of year
export const getWeekNumber = (date = new Date()) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// Get current week's days (Monday to Sunday) in IST
export const getCurrentWeekDays = () => {
    const istNow = getISTDate();
    const dayOfWeek = istNow.getDay(); // 0 (Sun) to 6 (Sat)
    const mondayAdjust = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to get Monday

    const monday = new Date(istNow);
    monday.setDate(istNow.getDate() + mondayAdjust);
    monday.setHours(0, 0, 0, 0);

    const days = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        days.push({
            name: dayNames[i],
            date: date,
            dateString: getISTDateString(date),
            isPast: date < istNow && getISTDateString(date) !== getISTDateString(istNow),
            isToday: getISTDateString(date) === getISTDateString(istNow),
            isFuture: date > istNow && getISTDateString(date) !== getISTDateString(istNow)
        });
    }

    return days;
};

// Generate last N days for heatmap (IST-aware)
export const getLastNDays = (n) => {
    const days = [];
    const istToday = getISTDate();
    istToday.setHours(0, 0, 0, 0);

    for (let i = n - 1; i >= 0; i--) {
        const date = new Date(istToday);
        date.setDate(istToday.getDate() - i);
        days.push({
            date: date,
            dateString: getISTDateString(date),
            dayOfWeek: date.getDay()
        });
    }

    return days;
};

// Format relative time
export const getRelativeTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return formatDate(new Date(date));
};
