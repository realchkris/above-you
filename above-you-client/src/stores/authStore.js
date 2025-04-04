import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useUIStore } from './uiStore';

export const useAuthStore = defineStore('auth', () => {
	const user = ref(null);
	const token = ref(localStorage.getItem('auth_token') || null);
	const ui = useUIStore();

	const isLoggedIn = computed(() => !!token.value);

	async function login(email, password) {
		ui.setLoading('auth', true);
		ui.clearError('auth');

		try {
			const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, { email, password });  // <-- Absolute URL here
			token.value = res.data.token;
			user.value = res.data.user;
			localStorage.setItem('auth_token', token.value);
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
			const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, { email, password });  // <-- Absolute URL here
			token.value = res.data.token;
			user.value = res.data.user;
			localStorage.setItem('auth_token', token.value);
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
		logout
	};
});
