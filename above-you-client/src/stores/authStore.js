import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useUIStore } from './uiStore';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('auth_token') || null);
  const ui = useUIStore();

  const isLoggedIn = computed(() => !!token.value);

  // Reactive function to update the user state
  function setUserState(userData, tokenData) {
    user.value = userData;
    token.value = tokenData;
    localStorage.setItem('auth_token', token.value);
  }

  async function login(email, password) {
    ui.setLoading('auth', true);
    ui.clearError('auth');

    try {
      const res = await axios.post('/api/auth/login', { email, password });
      setUserState(res.data.user, res.data.token);
    } catch (err) {
      ui.setError('auth', err.response?.data?.error || 'Login failed');
      throw err;
    } finally {
      ui.setLoading('auth', false);
    }
  }

  async function register(email, password) {
    ui.setLoading('auth', true);
    ui.clearError('auth');

    try {
      const res = await axios.post('/api/auth/register', { email, password });
      setUserState(res.data.user, res.data.token);
    } catch (err) {
      ui.setError('auth', err.response?.data?.error || 'Registration failed');
      throw err;
    } finally {
      ui.setLoading('auth', false);
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('auth_token');
  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    register,
    logout,
  };
});
