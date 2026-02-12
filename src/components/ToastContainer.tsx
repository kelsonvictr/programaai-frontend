import React from 'react'
import Toast from './Toast'
import type { Toast as ToastType } from '../hooks/useToast'
import '../styles/galaxy-toast.css'

interface ToastContainerProps {
  toasts: (ToastType & { exiting?: boolean })[]
  removeToast: (id: string) => void
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="galaxy-toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={removeToast} />
      ))}
    </div>
  )
}

export default ToastContainer
