import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { extractErrorMessage } from '@/utils/errorHelpers'

export const useUIStore = defineStore('ui', () => {

	// Reactive error and loading maps
	const errors = reactive({}) // Holds the error messages for different features
	const loading = reactive({}) // Holds which parts of the app are loading

	const globalError = ref(null)

	// Set a specific error for a module
	function setError(module, err, fallback = 'Something went wrong') {
		// Only set the error if there's a real error or if we have a valid message
		const message = extractErrorMessage(err, fallback);

		// If the message is different from the previous one, update the error
		if (message && message !== errors[module]) {
			errors[module] = message;
			globalError.value = message;
		}

		// Auto-clear after 5s if the error is not a persistent one
		setTimeout(() => {
			if (globalError.value === message) {
				globalError.value = null;
			}
		}, 5000);
	}

	function clearError(module) {
		delete errors[module]
	}

	function clearAllErrors() {
		Object.keys(errors).forEach(key => delete errors[key])
	}

	// Global error setter if needed
	function setGlobalError(message) {
		globalError.value = message
	}

	function clearGlobalError() {
		globalError.value = null
	}

	// Loading state per module
	function setLoading(module, value) {
		loading[module] = value
	}

	function isModuleLoading(module) {
		return !!loading[module]
	}

	return {
		errors,
		loading,
		globalError,

		setError,
		clearError,
		clearAllErrors,

		setGlobalError,
		clearGlobalError,

		setLoading,
		isModuleLoading
	}

})