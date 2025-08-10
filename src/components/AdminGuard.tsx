import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { auth } from '../firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

type Props = { children: ReactNode }
type GuardState = 'loading' | 'anon' | 'admin' | 'forbidden'

export default function AdminGuard({ children }: Props) {
  const [state, setState] = useState<GuardState>('loading')
  const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
        console.log(ADMIN_EMAIL)
      if (!u) return setState('anon')
      const email = (u.email || '').toLowerCase()
      const allowed = ADMIN_EMAIL && email === ADMIN_EMAIL
      setState(allowed ? 'admin' : 'forbidden')
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
