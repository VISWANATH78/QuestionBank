import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/axios';

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Current role mapping
const roleMapping: { [key: string]: string } = {
  'admin': 'ADMIN',
  'viewer': 'VIEWER',
  'selector': 'SELECTOR',
  'importer': 'IMPORTER',
  // Add legacy mappings for backward compatibility
  'student': 'VIEWER',
  'teacher': 'SELECTOR'
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await api.get('/api/users/me/');
        // Transform the backend role to frontend role using lowercase comparison
        const userData = {
          ...response.data,
          role: roleMapping[response.data.role.toLowerCase()] || response.data.role.toUpperCase()
        };
        console.log('Transformed user data:', userData);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  };

  const login = async (token: string) => {
    localStorage.setItem('token', token);
    try {
      const response = await api.get('/api/users/me/');
      // Transform the backend role to frontend role using lowercase comparison
      const userData = {
        ...response.data,
        role: roleMapping[response.data.role.toLowerCase()] || response.data.role.toUpperCase()
      };
      console.log('Transformed user data:', userData);
      setUser(userData);
    } catch (error) {
      localStorage.removeItem('token');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 