import { useEffect, useState } from 'react';
import styles from './Notification.module.css';

interface NotificationProps {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    onClose: () => void;
    duration?: number;
}

function Notification({ message, type, onClose, duration = 5000 }: NotificationProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for animation to complete
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    return (
        <div className={`${styles.notification} ${styles[type]} ${isVisible ? styles.visible : styles.hidden}`}>
            <div className={styles.content}>
                <span className={styles.message}>{message}</span>
                <button 
                    className={styles.closeButton} 
                    onClick={handleClose}
                    aria-label="Закрити повідомлення"
                >
                    ×
                </button>
            </div>
        </div>
    );
}

export default Notification;

