import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {

	state: () => ({
		globalError: null,
		isLoadingMap: true,
		isLoadingCoordinates: true,
		isLoadingLocation: true,
	}),

	actions: {
		setError(message) {
			this.globalError = message
		},
		clearError() {
			this.globalError = null
		},
		setLoading(key, value) {
			if (key in this) this[key] = value
		}
	}
	
})
