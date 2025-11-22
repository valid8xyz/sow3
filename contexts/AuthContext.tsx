
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole) => {
    // In a real app, this would use:
    // google.accounts.id.initialize()
    // google.accounts.id.prompt()
    // And then validate the JWT token on the backend to determine the role.
    
    const mockUser: User = {
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      name: role === 'ADMIN' ? 'Admin User' : role === 'AUDITOR' ? 'Jane Auditor' : 'John User',
      email: role === 'ADMIN' ? 'admin@example.com' : role === 'AUDITOR' ? 'auditor@example.com' : 'user@example.com',
      role: role,
      avatarUrl: `https://ui-avatars.com/api/?name=${role}&background=0ea5e9&color=fff`
    };
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
