import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

export const useUIStore = defineStore('ui', () => {

	// Reactive error and loading maps
	const errors = reactive({}) // Holds the error messages for different features
	const loading = reactive({}) // Holds which parts of the app are loading

	const globalError = ref(null)

	// Set a specific error for a module
	function setError(module, message) {
		errors[module] = message;
		globalError.value = message;

		// Optional: auto-clear after 5 seconds
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