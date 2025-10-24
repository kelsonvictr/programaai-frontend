import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import NavBar from './NavBar'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()
  const hideNav = location.pathname.startsWith('/tvsala')

  return (
    <>
      {!hideNav && <NavBar />}
      <main>{children}</main>
    </>
  )
}

export default Layout
