import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { loginUser, registerUser, setAuthTokens } from '../api/AuthApi';
import { useAuthContext } from '../contexts/AuthContext';
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import styles from './LoginPage.module.css';

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const navigate = useNavigate();
  const { refreshAuth } = useAuthContext();
  const { notifications, removeNotification, showError, showSuccess } = useNotification();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await loginUser(email, password);
      showSuccess('Успішна авторизація!');
      
      setAuthTokens(response);
      
      await refreshAuth();
      
      setTimeout(() => {
        navigate('/');
      }, 1000);
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error?.response?.status === 401) {
        showError('Невірний email або пароль');
      } else if (error?.response?.status === 400) {
        showError('Будь ласка, перевірте введені дані');
      } else {
        showError('Помилка авторизації. Спробуйте ще раз');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      await registerUser(userData);
      showSuccess('Акаунт успішно створено! Тепер ви можете увійти.');
      
      setIsLoginMode(true);
      
    } catch (error: any) {
      if (error?.response?.status === 400 || error?.response?.status === 409) {
        const errorMessage = error?.response?.data?.message;
        
        if (errorMessage && errorMessage.includes('already exists')) {
          showError('Користувач з таким email вже існує');
        } else {
          showError('Будь ласка, перевірте введені дані');
        }
      } else {
        showError('Помилка створення акаунта. Спробуйте ще раз');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          {isLoginMode ? 'Авторизація' : 'Реєстрація'}
        </h1>
        
        {isLoginMode ? (
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
        ) : (
          <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
        )}
        
        <div className={styles.switchMode}>
          {isLoginMode ? (
            <p>
              Немає акаунта?{' '}
              <button 
                onClick={() => setIsLoginMode(false)}
                className={styles.switchButton}
                disabled={isLoading}
              >
                Створити акаунт
              </button>
            </p>
          ) : (
            <p>
              Вже є акаунт?{' '}
              <button 
                onClick={() => setIsLoginMode(true)}
                className={styles.switchButton}
                disabled={isLoading}
              >
                Увійти
              </button>
            </p>
          )}
        </div>
      </div>
      
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default LoginPage;
