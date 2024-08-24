import moment from 'moment';

export const formatLastMessageDate = (timestamp: Date) => {
    const now = moment();
    const messageDate = moment(timestamp);

    if (now.isSame(messageDate, 'day')) {
        // Today
        return messageDate.format('HH:mm');
    } else if (now.subtract(1, 'day').isSame(messageDate, 'day')) {
        // Yesterday
        return 'Yesterday';
    } else if (now.diff(messageDate, 'days') < 7) {
        // Within the last 7 days
        return messageDate.format('dddd'); // Full day name (e.g., Monday)
    } else {
        // More than 7 days ago
        return messageDate.format('DD/MM/YY');
    }
};