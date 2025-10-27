import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../api/AuthApi';
import { useAuthContext } from '../contexts/AuthContext';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const { userProfile, isAuthenticated, isLoading, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      navigate('/login');
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  if (location.pathname === '/login') {
    return null;
  }

  if (isLoading) {
    return (
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.leftSection}>
            <button 
              onClick={handleHome}
              className={styles.homeButton}
            >
              Home
            </button>
          </div>
          <div className={styles.rightSection}>
            <span className={styles.loadingText}>Завантаження...</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <button 
            onClick={handleHome}
            className={styles.homeButton}
          >
            Home
          </button>
        </div>
        
        <div className={styles.rightSection}>
          {isAuthenticated && userProfile ? (
            <div className={styles.userSection}>
              <span className={styles.userInfo}>
                {userProfile.first_name} {userProfile.last_name}
              </span>
              <button 
                onClick={handleLogout}
                className={styles.logoutButton}
              >
                Вийти
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className={styles.loginButton}
            >
              Увійти
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
