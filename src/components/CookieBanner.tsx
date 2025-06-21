// src/components/CookieBanner.tsx
import { useState, useEffect } from "react"
import "./CookieBanner.css"

const CookieBanner = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent")
    if (!consent) setVisible(true)
  }, [])

  const handleConsent = (accepted: boolean) => {
    localStorage.setItem("cookieConsent", accepted ? "accepted" : "declined")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner">
      <p>
        Utilizamos cookies apenas para melhorar sua experiência. Ao continuar navegando, você concorda com isso.
      </p>
      <div className="cookie-actions">
        <button onClick={() => handleConsent(true)}>Concordo</button>
        <button onClick={() => handleConsent(false)}>Discordo</button>
      </div>
    </div>
  )
}

export default CookieBanner
