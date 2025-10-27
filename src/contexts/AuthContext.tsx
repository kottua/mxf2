import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAccessToken, getTokenType } from '../api/BaseApi';
import { getUserProfile } from '../api/AuthApi';
import type { UserProfile } from '../api/AuthApi';

interface AuthContextType {
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshAuth: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = async () => {
    setIsLoading(true);
    try {
      const accessToken = getAccessToken();
      const tokenType = getTokenType();
      
      if (accessToken && tokenType) {
        try {
          const profile = await getUserProfile();
          setUserProfile(profile);
          setIsAuthenticated(true);
        } catch (error) {
          setUserProfile(null);
          setIsAuthenticated(false);
        }
      } else {
        setUserProfile(null);
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUserProfile(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider value={{
      userProfile,
      isAuthenticated,
      isLoading,
      refreshAuth,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
