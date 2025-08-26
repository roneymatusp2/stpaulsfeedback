import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { teachersApi, type Teacher } from '@/lib/supabase';

interface AuthContextType {
  currentUser: Teacher | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if there's a stored user session
  useEffect(() => {
    const storedUserEmail = localStorage.getItem('stpauls_user_email');
    if (storedUserEmail) {
      loadUser(storedUserEmail);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async (email: string) => {
    try {
      setLoading(true);
      const user = await teachersApi.getByEmail(email);
      if (user) {
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('stpauls_user_email');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string): Promise<boolean> => {
    try {
      setLoading(true);
      const user = await teachersApi.getByEmail(email);
      
      if (user && user.active) {
        setCurrentUser(user);
        localStorage.setItem('stpauls_user_email', email);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('stpauls_user_email');
  };

  const value: AuthContextType = {
    currentUser,
    isAdmin: currentUser?.is_admin || false,
    isAuthenticated: currentUser !== null,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
