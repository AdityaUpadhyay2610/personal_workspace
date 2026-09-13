import api, { setAuthTokens, clearAuthTokens, getRefreshToken } from './api';

export const authServices = {
  /**
   * Register a new user account
   */
  async register(data) {
    const res = await api.post('/auth/register', data);
    if (res.accessToken && res.refreshToken) {
      setAuthTokens(res.accessToken, res.refreshToken);
      if (res.user) {
        localStorage.setItem('user', JSON.stringify(res.user));
      }
      localStorage.removeItem('isGuest');
    }
    return res;
  },

  /**
   * Log in to existing account
   */
  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    if (res.accessToken && res.refreshToken) {
      setAuthTokens(res.accessToken, res.refreshToken);
      if (res.user) {
        localStorage.setItem('user', JSON.stringify(res.user));
      }
      localStorage.removeItem('isGuest');
    }
    return res;
  },

  /**
   * Refresh access token
   */
  async refresh(refreshToken) {
    const res = await api.post('/auth/refresh', { refreshToken });
    if (res.accessToken && res.refreshToken) {
      setAuthTokens(res.accessToken, res.refreshToken);
    }
    return res;
  },

  /**
   * Log out user
   */
  async logout() {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (err) {
      console.warn('Logout server notification failed:', err);
    } finally {
      clearAuthTokens();
    }
  },

  /**
   * Fetch current authenticated user profile
   */
  async getMe() {
    return api.get('/auth/me');
  },
};

export default authServices;
