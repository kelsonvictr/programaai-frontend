import { useEffect, useMemo, useState } from "react"

interface TypewriterProps {
  phrases: string[]
  typeSpeed?: number
  deleteSpeed?: number
  pauseTime?: number
  className?: string
}

const Typewriter = ({
  phrases,
  typeSpeed = 80,
  deleteSpeed = 40,
  pauseTime = 1500,
  className = "",
}: TypewriterProps) => {
  const safePhrases = useMemo(() => phrases.filter(Boolean), [phrases])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [subIndex, setSubIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (safePhrases.length === 0) return

    if (subIndex === safePhrases[currentIndex].length + 1 && !isDeleting) {
      const timeout = setTimeout(() => setIsDeleting(true), pauseTime)
      return () => clearTimeout(timeout)
    }

    if (subIndex === 0 && isDeleting) {
      setIsDeleting(false)
      setCurrentIndex(prev => (prev + 1) % safePhrases.length)
      return
    }

    const interval = setTimeout(() => {
      setSubIndex(prev => prev + (isDeleting ? -1 : 1))
    }, isDeleting ? deleteSpeed : typeSpeed)

    return () => clearTimeout(interval)
  }, [subIndex, currentIndex, isDeleting, safePhrases, typeSpeed, deleteSpeed, pauseTime])

  useEffect(() => {
    setCurrentIndex(0)
    setSubIndex(0)
    setIsDeleting(false)
  }, [safePhrases])

  const currentPhrase = safePhrases[currentIndex] ?? ""
  const displayText = currentPhrase.substring(0, subIndex)

  return (
    <span className={`typewriter ${className}`} aria-live="polite">
      {displayText}
      <span className="typewriter-caret" aria-hidden="true" />
    </span>
  )
}

export default Typewriter
