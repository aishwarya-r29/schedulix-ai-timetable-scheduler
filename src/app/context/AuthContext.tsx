import React, { createContext, useState, useContext, ReactNode } from 'react';
import { getAllUsers, User, FACULTIES, STUDENTS } from '../data/mockData';
import { loginApi } from '../utils/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const serverUser = await loginApi(email, password);
      if (serverUser?.id) {
        setUser(serverUser);
        localStorage.setItem('schedulix_user', JSON.stringify(serverUser));
        return true;
      }
    } catch (error) {
      // If backend is unavailable, fall back to local mock data
    }

    const users = getAllUsers();
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('schedulix_user', JSON.stringify(foundUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('schedulix_user');
  };

  // Check for existing session on mount
  React.useEffect(() => {
    const savedUser = localStorage.getItem('schedulix_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Helper function to get faculty details by user id
export const getFacultyByUserId = (userId: string) => {
  return FACULTIES.find(f => f.userId === userId);
};

// Helper function to get student details by user id
export const getStudentByUserId = (userId: string) => {
  return STUDENTS.find(s => s.userId === userId);
};
