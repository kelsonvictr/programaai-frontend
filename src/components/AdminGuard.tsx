// src/components/AdminGuard.tsx
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { Navigate } from 'react-router-dom'

type Props = { children: ReactNode }

export default function AdminGuard({ children }: Props) {
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (!u) return setAllowed(false)
      const t = await u.getIdTokenResult(true)
      const isAdmin = t.claims?.admin === true
      setAllowed(isAdmin /* || isAdminEmail */)
    })
    return () => unsub()
  }, [])

  if (allowed === null) return null // ou um spinner
  return allowed ? <>{children}</> : <Navigate to="/" replace />
}
