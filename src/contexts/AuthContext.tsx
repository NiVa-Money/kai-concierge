import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('kai-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockUser: User = {
        id: '1',
        name: 'Alexander Sterling',
        email: email,
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        socialHandles: {},
        persona: {
          style: 'Sophisticated, minimalist',
          preferences: ['Fine dining', 'Luxury travel', 'Art collecting'],
          profession: 'Private Equity',
          lifestyle: ['Health-conscious', 'Tech-savvy', 'Philanthropic'],
          tone: 'Professional yet approachable'
        },
        isOpsTeam: false
      };
      setUser(mockUser);
      localStorage.setItem('kai-user', JSON.stringify(mockUser));
      setIsLoading(false);
    }, 1000);
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    // Simulate Google OAuth
    setTimeout(() => {
      const mockUser: User = {
        id: '1',
        name: 'Alexander Sterling',
        email: 'alexander@sterling.com',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        socialHandles: {},
        persona: {
          style: 'Sophisticated, minimalist',
          preferences: ['Fine dining', 'Luxury travel', 'Art collecting'],
          profession: 'Private Equity',
          lifestyle: ['Health-conscious', 'Tech-savvy', 'Philanthropic'],
          tone: 'Professional yet approachable'
        },
        isOpsTeam: false
      };
      setUser(mockUser);
      localStorage.setItem('kai-user', JSON.stringify(mockUser));
      setIsLoading(false);
    }, 1000);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kai-user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('kai-user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithGoogle,
      logout,
      updateUser,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};