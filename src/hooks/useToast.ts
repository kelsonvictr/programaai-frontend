import { useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastWithExiting extends Toast {
  exiting?: boolean
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastWithExiting[]>([])

  const showToast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    duration: number = 3000
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    const newToast: Toast = { id, type, title, message, duration }
    
    setToasts(prev => [...prev, newToast])

    // Auto-remover após a duração
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    // Primeiro marca como exiting para animação
    setToasts(prev =>
      prev.map(toast => (toast.id === id ? { ...toast, exiting: true } : toast))
    )

    // Remove após a animação
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 300)
  }, [])

  const success = useCallback((title: string, message?: string, duration?: number) => {
    return showToast('success', title, message, duration)
  }, [showToast])

  const error = useCallback((title: string, message?: string, duration?: number) => {
    return showToast('error', title, message, duration)
  }, [showToast])

  const info = useCallback((title: string, message?: string, duration?: number) => {
    return showToast('info', title, message, duration)
  }, [showToast])

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    return showToast('warning', title, message, duration)
  }, [showToast])

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info,
    warning
  }
}

export default useToast
