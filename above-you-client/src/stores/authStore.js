import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import axios from 'axios';
import { useUIStore } from '@/stores/uiStore';
import { extractErrorMessage } from '@/utils/errorHelpers';

export const useAuthStore = defineStore('auth', () => {

	const user = ref(null);
	const token = ref(localStorage.getItem('auth_token') || null);
	const ui = useUIStore();
	const BASE_URL = import.meta.env.VITE_API_BASE_URL;

	const isLoggedIn = computed(() => !!token.value);

	// Sync token to localStorage reactively
	watch(token, (newToken) => {
		if (newToken) {
			localStorage.setItem('auth_token', newToken);
		} else {
			localStorage.removeItem('auth_token');
		}
	});

	function setUserState(userData, tokenData) {
		user.value = userData;
		token.value = tokenData;
	}

	async function login(email, password) {
		ui.setLoading('auth', true);
		ui.clearError('auth');

		try {
			const res = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });
			setUserState(res.data.user, res.data.token);
			ui.setSuccess('auth', 'Logged In!');
		} catch (err) {
			ui.setError('auth', extractErrorMessage(err, '❌ Login failed.'));
			throw err;
		} finally {
			ui.setLoading('auth', false);
		}
	}

	async function register(email, password) {
		ui.setLoading('auth', true);
		ui.clearError('auth');

		try {
			const res = await axios.post(`${BASE_URL}/api/auth/register`, { email, password });
			setUserState(res.data.user, res.data.token);
			ui.setSuccess('auth', 'Welcome!');
		} catch (err) {
			ui.setError('auth', extractErrorMessage(err, '❌ Sign Up failed.'));
			throw err;
		} finally {
			ui.setLoading('auth', false);
		}
	}

	function logout() {
		token.value = null;
		user.value = null;
		ui.setSuccess('auth', 'Logged Out!');
	}

	async function deleteAccount() {
		ui.setLoading('auth', true);
		ui.clearError('auth');

		console.log("here!!!");

		try {
			await axios.delete(`${BASE_URL}/api/protected/delete`, {
				headers: {
					Authorization: `Bearer ${token.value}`,
				},
			});

			// Success: Handle successful deletion
			logout();
			ui.setSuccess('auth', '🗑️ Account successfully deleted.');

		} catch (err) {
			ui.setError('auth', extractErrorMessage(err, '❌ Account deletion failed.'));
			throw err;
		} finally {
			ui.setLoading('auth', false);
		}
	}

	return {
		user,
		token,
		isLoggedIn,
		login,
		register,
		logout,
		deleteAccount,
	};
});