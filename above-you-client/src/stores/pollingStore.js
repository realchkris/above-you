import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const usePollingStore = defineStore('polling', () => {
  
  const intervals = reactive({})

  function start(key, fn, interval) {
    stop(key) // Prevent duplicates
    intervals[key] = setInterval(fn, interval)
  }

  function stop(key) {
    if (intervals[key]) {
      clearInterval(intervals[key])
      delete intervals[key]
    }
  }

  function stopAll() {
    Object.keys(intervals).forEach(key => stop(key))
  }

  return {
    start,
    stop,
    stopAll,
  }

})