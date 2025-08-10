// src/components/AdminGuard.tsx
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { auth } from '../firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

type Props = { children: ReactNode }
type GuardState = 'loading' | 'anon' | 'admin' | 'forbidden'

export default function AdminGuard({ children }: Props) {
  const [state, setState] = useState<GuardState>('loading')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (!u) return setState('anon')
      const t = await u.getIdTokenResult(true)
      const isAdmin = t.claims?.admin === true
      setState(isAdmin ? 'admin' : 'forbidden')
    })
    return () => unsub()
  }, [])

  if (state === 'loading') return null

  if (state === 'forbidden') {
    return (
      <div style={{ padding: 24 }}>
        <h3>Acesso restrito</h3>
        <p>Esta área é apenas para administradores.</p>
        <button onClick={() => signOut(auth)}>Sair e trocar de conta</button>
      </div>
    )
  }

  return <>{children}</>
}
