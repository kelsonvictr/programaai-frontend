import { useState, useCallback } from 'react'

type FieldStatus = 'idle' | 'saving' | 'saved' | 'error'

interface FieldFeedback {
  [key: string]: FieldStatus
}

export const useFieldFeedback = () => {
  const [feedback, setFeedback] = useState<FieldFeedback>({})

  const setFieldStatus = useCallback((fieldKey: string, status: FieldStatus) => {
    setFeedback(prev => ({ ...prev, [fieldKey]: status }))

    // Auto-limpar status 'saved' ou 'error' após 2 segundos
    if (status === 'saved' || status === 'error') {
      setTimeout(() => {
        setFeedback(prev => {
          const { [fieldKey]: removed, ...rest } = prev
          void removed
          return rest
        })
      }, 2000)
    }
  }, [])

  const getFieldStatus = useCallback((fieldKey: string): FieldStatus => {
    return feedback[fieldKey] || 'idle'
  }, [feedback])

  const clearFieldStatus = useCallback((fieldKey: string) => {
    setFeedback(prev => {
      const { [fieldKey]: removed, ...rest } = prev
      void removed
      return rest
    })
  }, [])

  const getFieldClassName = useCallback((fieldKey: string): string => {
    const status = feedback[fieldKey]
    if (status === 'saved') return 'galaxy-field-success'
    if (status === 'error') return 'galaxy-field-error'
    return ''
  }, [feedback])

  return {
    setFieldStatus,
    getFieldStatus,
    clearFieldStatus,
    getFieldClassName
  }
}

export default useFieldFeedback
