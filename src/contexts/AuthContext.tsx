import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { authService, AUTH_TOKEN_KEY, AUTH_USER_KEY, clearAuthSession } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isBootstrapping: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const getStoredUser = (): User | null => {
    try {
      const raw = sessionStorage.getItem(AUTH_USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!sessionStorage.getItem(AUTH_TOKEN_KEY)
  );
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(
    () => !!sessionStorage.getItem(AUTH_TOKEN_KEY)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setIsBootstrapping(false);
      return;
    }

    let active = true;

    authService.me()
      .then((currentUser) => {
        if (!active) return;
        setUser(currentUser);
        setIsAuthenticated(true);
      })
      .catch(() => {
        if (!active) return;
        clearAuthSession();
        setUser(null);
        setIsAuthenticated(false);
      })
      .finally(() => {
        if (!active) return;
        setIsBootstrapping(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      if (!response.access_token) {
        throw new Error('Token não retornado no login');
      }
      setIsAuthenticated(true);
      setUser(response.user ?? getStoredUser());
    } catch {
      setError('E-mail ou senha inválidos. Tente novamente.');
      throw new Error('Credenciais inválidas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isBootstrapping, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
