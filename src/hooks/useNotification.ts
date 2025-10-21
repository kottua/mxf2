import { useState, useCallback } from 'react';

interface NotificationState {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    id: number;
}

export function useNotification() {
    const [notifications, setNotifications] = useState<NotificationState[]>([]);

    const addNotification = useCallback((
        message: string, 
        type: 'success' | 'error' | 'warning' | 'info' = 'info'
    ) => {
        const id = Date.now() + Math.random();
        setNotifications(prev => [...prev, { message, type, id }]);
    }, []);

    const removeNotification = useCallback((id: number) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const showSuccess = useCallback((message: string) => {
        addNotification(message, 'success');
    }, [addNotification]);

    const showError = useCallback((message: string) => {
        addNotification(message, 'error');
    }, [addNotification]);

    const showWarning = useCallback((message: string) => {
        addNotification(message, 'warning');
    }, [addNotification]);

    const showInfo = useCallback((message: string) => {
        addNotification(message, 'info');
    }, [addNotification]);

    return {
        notifications,
        addNotification,
        removeNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo
    };
}

