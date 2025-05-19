export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

let toastList = $state<Toast[]>([])

export function addToast(message: string, type: ToastType = 'info', duration: number = 3000): void {
  const id = Math.random().toString(36).substring(2)
  const toast: Toast = { id, message, type, duration }

  toastList.push(toast)

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }
}

export function removeToast(id: string): void {
  toastList = toastList.filter((t) => t.id !== id)
}

export const toasts = {
  success: (message: string, duration?: number) => addToast(message, 'success', duration),
  error: (message: string, duration?: number) => addToast(message, 'error', duration),
  info: (message: string, duration?: number) => addToast(message, 'info', duration),
  warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
  remove: removeToast,
  get: () => toastList
}
