'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, ApiError } from '../api-client';
import { clearLegacyAuthStorage, migrateLegacyAuthSession } from '../api-client/auth-utils';

interface User {
  id: string;
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  roles?: string[];
}

interface AuthContextType {
  user: User | null;
  /** @deprecated Token is stored in an httpOnly cookie; always null on the client. */
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  roles: string[];
  login: (_emailOrPhone: string, _password: string) => Promise<void>;
  register: (_data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterData {
  email?: string;
  phone?: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface AuthResponse {
  user: User;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchCurrentUser(): Promise<User | null> {
  try {
    const profile = await apiClient.get<User>('/api/v1/users/profile');
    if (!profile?.id) {
      return null;
    }
    return profile;
  } catch {
    return null;
  }
}

function userHasRoles(user: User | null): boolean {
  return Array.isArray(user?.roles) && user.roles.length > 0;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  /** Prevents infinite /profile refetch when roles stay empty after one refresh. */
  const rolesRefreshAttemptedRef = useRef(false);

  const refreshSession = useCallback(async () => {
    const profile = await fetchCurrentUser();
    setUser(profile);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      try {
        await migrateLegacyAuthSession();
        if (cancelled) {
          return;
        }
        const profile = await fetchCurrentUser();
        if (!cancelled) {
          setUser(profile);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (emailOrPhone: string, password: string) => {
    try {
      setIsLoading(true);

      const isEmail = emailOrPhone.includes('@');
      const requestData = isEmail
        ? { email: emailOrPhone, password }
        : { phone: emailOrPhone, password };

      const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', requestData, {
        skipAuth: true,
      });

      clearLegacyAuthStorage();
      setUser(response.user);
      window.dispatchEvent(new Event('auth-updated'));
    } catch (error: unknown) {
      let errorMessage = 'Login failed. Please try again.';

      if (error instanceof ApiError) {
        if (error.status === 401) {
          errorMessage = error.message || 'Invalid email/phone or password';
        } else if (error.status === 403) {
          errorMessage = error.message || 'Your account has been blocked';
        } else if (error.status === 400) {
          errorMessage = error.message || 'Please provide email/phone and password';
        } else if (error.status === 429) {
          errorMessage = error.message || 'Too many login attempts. Please try again later.';
        } else {
          errorMessage = error.message || errorMessage;
        }
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);

      const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', data, {
        skipAuth: true,
      });

      if (!response?.user) {
        throw new Error('Invalid response from server');
      }

      clearLegacyAuthStorage();
      setUser(response.user);
      window.dispatchEvent(new Event('auth-updated'));
      router.push('/');
    } catch (error: unknown) {
      let errorMessage = 'Registration failed. Please try again.';

      if (error instanceof ApiError) {
        if (error.status === 409) {
          errorMessage = error.message || 'User with this email or phone already exists';
        } else if (error.status === 400) {
          errorMessage = error.message || 'Invalid registration data. Please check your input.';
        } else if (error.status === 429) {
          errorMessage = error.message || 'Too many registration attempts. Please try again later.';
        } else {
          errorMessage = error.message || errorMessage;
        }
      } else if (error instanceof Error) {
        const errorText = error.message;
        if (errorText.includes('409') || errorText.includes('already exists')) {
          errorMessage = 'User with this email or phone already exists';
        } else if (errorText.includes('password') || errorText.includes('Password')) {
          errorMessage = 'Password must be at least 8 characters';
        } else if (errorText) {
          errorMessage = errorText;
        }
      }

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/api/v1/auth/logout', undefined, { skipAuth: true });
    } catch {
      // Cookie clear is best-effort; local state must still reset.
    }

    clearLegacyAuthStorage();
    setUser(null);
    window.dispatchEvent(new Event('auth-updated'));
    router.push('/');
  };

  const roles = user && Array.isArray(user.roles) ? user.roles : [];
  const isAdmin = roles.includes('admin');

  useEffect(() => {
    if (!user?.id) {
      rolesRefreshAttemptedRef.current = false;
      return;
    }

    if (userHasRoles(user) || rolesRefreshAttemptedRef.current) {
      return;
    }

    rolesRefreshAttemptedRef.current = true;
    void refreshSession();
  }, [user, refreshSession]);

  const value: AuthContextType = {
    user,
    token: null,
    isLoggedIn: !!user,
    isLoading,
    isAdmin,
    roles,
    login,
    register,
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
