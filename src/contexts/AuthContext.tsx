
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthStatus, User } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demo purposes
const MOCK_USERS = [
  {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User',
    password: 'password123',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const { toast } = useToast();

  useEffect(() => {
    // Check local storage for existing user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setStatus('authenticated');
    } else {
      setStatus('unauthenticated');
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    setStatus('loading');
    
    try {
      // Simple mock authentication
      const foundUser = MOCK_USERS.find(
        (u) => u.email === email && u.password === password
      );
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      const { password: _, ...userWithoutPassword } = foundUser;
      
      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setUser(userWithoutPassword);
      setStatus('authenticated');
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      toast({
        title: 'Success',
        description: 'You have been logged in successfully',
      });
    } catch (error) {
      setStatus('unauthenticated');
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setStatus('loading');
    
    try {
      // Check if user already exists
      if (MOCK_USERS.some((u) => u.email === email)) {
        throw new Error('User with this email already exists');
      }
      
      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Create new user (in a real app this would be an API call)
      const newUser = {
        id: Date.now().toString(),
        email,
        name,
      };
      
      // Add to mock users (this is just for demo, would not happen in real app)
      MOCK_USERS.push({ ...newUser, password });
      
      setUser(newUser);
      setStatus('authenticated');
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast({
        title: 'Success',
        description: 'Your account has been created',
      });
    } catch (error) {
      setStatus('unauthenticated');
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const logout = () => {
    setUser(null);
    setStatus('unauthenticated');
    localStorage.removeItem('user');
    toast({
      title: 'Success',
      description: 'You have been logged out',
    });
  };

  return (
    <AuthContext.Provider value={{ user, status, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
