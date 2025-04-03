import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserLocationStore = defineStore('userLocation', () => {

	const userCoordinates = ref({ lat: null, lon: null })
	const userLocation = ref("")
	
	return { userCoordinates, userLocation }

})
