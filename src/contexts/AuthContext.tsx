import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  google_user_data?: {
    given_name?: string;
  };
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isPending: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  redirectToLogin: () => Promise<void>;
  exchangeCodeForSessionToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsPending(false);
      }
    };

    checkAuth();
  }, []);

  const login = async () => {
    try {
      // Call the backend login endpoint to set session cookie
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Fetch user data after successful login
        const userResponse = await fetch('/api/users/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setUser(null);
  };

  const redirectToLogin = async () => {
    // Simulate OAuth redirect
    await login();
  };

  const exchangeCodeForSessionToken = async () => {
    // Simulate code exchange
    await login();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isPending,
      login,
      logout,
      redirectToLogin,
      exchangeCodeForSessionToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 