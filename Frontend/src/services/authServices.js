import api, { setAccessToken, clearAuthTokens } from './api';

export const authServices = {
  /**
   * Register a new user account
   */
  async register(data) {
    const res = await api.post('/auth/register', data);
    if (res.accessToken) {
      setAccessToken(res.accessToken);
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
    if (res.accessToken) {
      setAccessToken(res.accessToken);
      if (res.user) {
        localStorage.setItem('user', JSON.stringify(res.user));
      }
      localStorage.removeItem('isGuest');
    }
    return res;
  },

  /**
   * Refresh access token using secure HttpOnly cookie
   */
  async refresh() {
    const res = await api.post('/auth/refresh', {});
    if (res.accessToken) {
      setAccessToken(res.accessToken);
    }
    return res;
  },

  /**
   * Log out user and clear session
   */
  async logout() {
    try {
      await api.post('/auth/logout', {});
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
