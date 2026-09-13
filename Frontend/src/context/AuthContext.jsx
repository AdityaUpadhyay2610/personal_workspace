import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authServices from '../services/authServices';
import { getAccessToken, clearAuthTokens } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem('isGuest') === 'true';
  });

  const [loading, setLoading] = useState(true);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Initialize and verify user auth session
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const token = getAccessToken();

      if (token) {
        try {
          const res = await authServices.getMe();
          if (isMounted && res?.user) {
            setUser(res.user);
            localStorage.setItem('user', JSON.stringify(res.user));
            setIsGuest(false);
          }
        } catch (err) {
          console.warn('Access token expired, attempting silent cookie refresh:', err);
          try {
            const refreshRes = await authServices.refresh();
            if (refreshRes && isMounted) {
              const profileRes = await authServices.getMe();
              if (isMounted && profileRes?.user) {
                setUser(profileRes.user);
                localStorage.setItem('user', JSON.stringify(profileRes.user));
                setIsGuest(false);
              }
            }
          } catch {
            if (isMounted) {
              clearAuthTokens();
              setUser(null);
            }
          }
        }
      } else {
        // Attempt silent cookie refresh even if access token is empty
        try {
          const refreshRes = await authServices.refresh();
          if (refreshRes && isMounted) {
            const profileRes = await authServices.getMe();
            if (isMounted && profileRes?.user) {
              setUser(profileRes.user);
              localStorage.setItem('user', JSON.stringify(profileRes.user));
              setIsGuest(false);
            }
          }
        } catch {
          if (localStorage.getItem('isGuest') === 'true' && isMounted) {
            setIsGuest(true);
            setUser(null);
          }
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    }

    checkAuth();

    // Listen for global auth expiration events from api.js
    const handleAuthExpired = () => {
      setUser(null);
      setIsGuest(false);
      clearAuthTokens();
    };

    window.addEventListener('auth:expired', handleAuthExpired);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, []);

  // Login handler
  const login = useCallback(async (credentials) => {
    const res = await authServices.login(credentials);
    setUser(res.user);
    setIsGuest(false);
    return res;
  }, []);

  // Register handler
  const register = useCallback(async (data) => {
    const res = await authServices.register(data);
    setUser(res.user);
    setIsGuest(false);
    setIsRegisterModalOpen(false);
    return res;
  }, []);

  // Continue as Guest handler
  const continueAsGuest = useCallback(() => {
    clearAuthTokens();
    setUser(null);
    setIsGuest(true);
    localStorage.setItem('isGuest', 'true');
  }, []);

  // Logout handler
  const logout = useCallback(async () => {
    await authServices.logout();
    setUser(null);
    setIsGuest(false);
  }, []);

  const openRegisterModal = useCallback(() => {
    setIsRegisterModalOpen(true);
  }, []);

  const closeRegisterModal = useCallback(() => {
    setIsRegisterModalOpen(false);
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user && getAccessToken()),
    isGuest,
    loading,
    login,
    register,
    continueAsGuest,
    logout,
    isRegisterModalOpen,
    openRegisterModal,
    closeRegisterModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
