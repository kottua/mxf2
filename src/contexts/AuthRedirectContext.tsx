import React, { createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  redirectToLogin: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthRedirect = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthRedirect must be used within an AuthRedirectProvider');
  }
  return context;
};

interface AuthRedirectProviderProps {
  children: React.ReactNode;
}

export const AuthRedirectProvider: React.FC<AuthRedirectProviderProps> = ({ children }) => {
  const navigate = useNavigate();

  const redirectToLogin = () => {
    navigate('/login', { replace: true });
  };

  // Глобальная функция для использования в BaseApi
  useEffect(() => {
    (window as any).redirectToLogin = redirectToLogin;
    
    return () => {
      delete (window as any).redirectToLogin;
    };
  }, [redirectToLogin]);

  return (
    <AuthContext.Provider value={{ redirectToLogin }}>
      {children}
    </AuthContext.Provider>
  );
};
