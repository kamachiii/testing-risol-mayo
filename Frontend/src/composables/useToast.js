import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

export function useToast() {
  function addToast(message, type = 'success', duration = 3000) {
    const id = ++toastId
    // Limit max 5 toasts
    if (toasts.value.length >= 5) {
      toasts.value.shift()
    }
    toasts.value.push({ id, message, type, duration })
    return id
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function success(message, duration) { return addToast(message, 'success', duration) }
  function error(message, duration) { return addToast(message, 'error', duration) }
  function info(message, duration) { return addToast(message, 'info', duration) }
  function warning(message, duration) { return addToast(message, 'warning', duration) }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
  }
}
