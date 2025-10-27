import React, { useState } from 'react';
import styles from './RegisterForm.module.css';

interface RegisterFormProps {
  onSubmit: (userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Ім\'я обов\'язкове';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Прізвище обов\'язкове';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обов\'язковий';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректний email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обов\'язковий';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль повинен містити мінімум 6 символів';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Підтвердження пароля обов\'язкове';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Паролі не співпадають';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const { confirmPassword, ...userData } = formData;
      await onSubmit(userData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form className={styles.registerForm} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <input
          type="text"
          id="first_name"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          placeholder="ІМ'Я"
          className={`${styles.input} ${errors.first_name ? styles.inputError : ''}`}
          required
          disabled={isLoading}
        />
        {errors.first_name && <span className={styles.errorText}>{errors.first_name}</span>}
      </div>

      <div className={styles.formGroup}>
        <input
          type="text"
          id="last_name"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          placeholder="ПРІЗВИЩЕ"
          className={`${styles.input} ${errors.last_name ? styles.inputError : ''}`}
          required
          disabled={isLoading}
        />
        {errors.last_name && <span className={styles.errorText}>{errors.last_name}</span>}
      </div>
      
      <div className={styles.formGroup}>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="EMAIL"
          className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
          required
          disabled={isLoading}
        />
        {errors.email && <span className={styles.errorText}>{errors.email}</span>}
      </div>
      
      <div className={styles.formGroup}>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="ПАРОЛЬ"
          className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
          required
          disabled={isLoading}
        />
        {errors.password && <span className={styles.errorText}>{errors.password}</span>}
      </div>

      <div className={styles.formGroup}>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="ПІДТВЕРДІТЬ ПАРОЛЬ"
          className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
          required
          disabled={isLoading}
        />
        {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
      </div>
      
      <button 
        type="submit" 
        className={styles.submitButton}
        disabled={isLoading}
      >
        {isLoading ? 'Створення акаунта...' : 'Створити акаунт'}
      </button>
    </form>
  );
};

export default RegisterForm;
