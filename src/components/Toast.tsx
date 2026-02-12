import React from 'react'
import type { Toast as ToastType } from '../hooks/useToast'
import '../styles/galaxy-toast.css'

interface ToastProps extends ToastType {
  onClose: (id: string) => void
  exiting?: boolean
}

const Toast: React.FC<ToastProps> = ({ id, type, title, message, onClose, exiting }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      case 'info':
      default:
        return 'ℹ'
    }
  }

  return (
    <div className={`galaxy-toast ${type} ${exiting ? 'exiting' : ''}`}>
      <div className="galaxy-toast-icon">{getIcon()}</div>
      <div className="galaxy-toast-content">
        <div className="galaxy-toast-title">{title}</div>
        {message && <div className="galaxy-toast-message">{message}</div>}
      </div>
      <button
        className="galaxy-toast-close"
        onClick={() => onClose(id)}
        aria-label="Fechar"
      >
        ×
      </button>
      <div className="galaxy-toast-progress">
        <div className="galaxy-toast-progress-bar" />
      </div>
    </div>
  )
}

export default Toast
