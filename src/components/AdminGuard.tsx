// src/components/AdminGuard.tsx
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { Navigate } from 'react-router-dom'

type Props = { children: ReactNode }
type GuardState = 'loading' | 'anon' | 'admin' | 'forbidden'

export default function AdminGuard({ children }: Props) {
  const [state, setState] = useState<GuardState>('loading')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (!u) return setState('anon') // deixa renderizar a página com o form
      const t = await u.getIdTokenResult(true)
      const isAdmin = t.claims?.admin === true
      setState(isAdmin ? 'admin' : 'forbidden')
    })
    return () => unsub()
  }, [])

  if (state === 'loading') return null
  if (state === 'forbidden') return <Navigate to="/" replace />
  // anon ou admin renderiza a página (no Admin você mostra login ou dados)
  return <>{children}</>
}
