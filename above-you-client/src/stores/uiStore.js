import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { extractErrorMessage } from '@/utils/errorHelpers'

export const useUIStore = defineStore('ui', () => {

	// Reactive error and loading maps
	const errors = reactive({}) // Holds the error messages for different features
	const loading = reactive({}) // Holds which parts of the app are loading
	const successes = reactive({}) // Holds the success messages for different features

	const globalError = ref(null) // For global error message
	const globalSuccess = ref(null); // For global success message

	const confirmationModalVisible = ref(false);
	const confirmationModalMessage = ref(''); // Message for the modal

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

	// Set success message
	function setSuccess(module, message) {
		successes[module] = message;
		globalSuccess.value = message;

		// Auto-clear after 5s
		setTimeout(() => {
			globalSuccess.value = null;
		}, 5000);
	}

	// Clear error for a module
	function clearError(module) {
		delete errors[module]
	}

	// Clear success for a module
	function clearSuccess(module) {
		delete successes[module];
	}

	// Clear all errors
	function clearAllErrors() {
		Object.keys(errors).forEach((key) => delete errors[key]);
	}

	// Clear all success messages
	function clearAllSuccess() {
		Object.keys(successes).forEach((key) => delete successes[key]);
	}

	// Global error setter if needed
	function setGlobalError(message) {
		globalError.value = message
	}

	// Global success setter if needed
	function setGlobalSuccess(message) {
		globalSuccess.value = message;
	}

	function clearGlobalError() {
		globalError.value = null
	}

	function clearGlobalSuccess() {
		globalSuccess.value = null;
	}

	// Loading state per module
	function setLoading(module, value) {
		loading[module] = value
	}

	function isModuleLoading(module) {
		return !!loading[module]
	}

	// Set the confirmation modal visibility and message
	function showConfirmationModal(message) {
		confirmationModalMessage.value = message || 'Are you sure?';
		confirmationModalVisible.value = true;
	}

	// Hide the confirmation modal
	function hideConfirmationModal() {
		confirmationModalVisible.value = false;
	}

	return {

		errors,
		loading,
		successes,

		globalError,
		globalSuccess,

		setError,
		setSuccess,

		clearError,
		clearSuccess,

		clearAllErrors,
		clearAllSuccess,

		setGlobalError,
		setGlobalSuccess,

		clearGlobalError,
		clearGlobalSuccess,

		setLoading,
		isModuleLoading,

		confirmationModalVisible,
		confirmationModalMessage,

		showConfirmationModal,
  		hideConfirmationModal

	}

})