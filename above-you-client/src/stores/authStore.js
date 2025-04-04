import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import { useUIStore } from './uiStore';

export const useAuthStore = defineStore('auth', () => {

	const user = ref(null);
	const token = ref(localStorage.getItem('auth_token') || null);
	const ui = useUIStore();

	async function login(email, password) {

		ui.setLoading('auth', true);
		ui.clearError('auth');

		try {
			const res = await axios.post('/api/auth/login', { email, password });
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
			const res = await axios.post('/api/auth/register', { email, password });
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
		login,
		register,
		logout
	};

});