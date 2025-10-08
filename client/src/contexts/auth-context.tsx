import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User, RegisterRequest, LoginRequest } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('auth_token')
  );
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/auth/me'],
    enabled: !!token,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      return response.json();
    },
    onSuccess: (data: { user: User; token: string }) => {
      localStorage.setItem('auth_token', data.token);
      setToken(data.token);
      queryClient.setQueryData(['/api/auth/me'], data.user);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      return response.json();
    },
    onSuccess: (data: { user: User; token: string }) => {
      localStorage.setItem('auth_token', data.token);
      setToken(data.token);
      queryClient.setQueryData(['/api/auth/me'], data.user);
    },
  });

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    queryClient.clear();
  };

  // Set Authorization header for all requests
  useEffect(() => {
    if (token) {
      const originalFetch = window.fetch;
      window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
        const headers = new Headers(init?.headers);
        headers.set('Authorization', `Bearer ${token}`);
        return originalFetch(input, { ...init, headers });
      };
    }
  }, [token]);

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    login: async (credentials) => {
      await loginMutation.mutateAsync(credentials);
    },
    register: async (data) => {
      await registerMutation.mutateAsync(data);
    },
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
