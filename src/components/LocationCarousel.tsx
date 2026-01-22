import { useEffect, useState } from "react"
import "../styles/location-carousel.css"

interface GalleryPhoto {
  src: string
}

interface GalleryResponse {
  photos?: GalleryPhoto[]
}

const LocationCarousel = () => {
  const [photos, setPhotos] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    const loadPhotos = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}course-details-gallery.json`, {
          cache: "no-store",
          signal: controller.signal,
        })
        if (response.ok) {
          const data = (await response.json()) as GalleryResponse
          const photoUrls = (data.photos ?? []).map(p => p.src).filter(Boolean)
          setPhotos(photoUrls)
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.warn("Erro ao carregar fotos:", error)
        }
      }
    }

    loadPhotos()

    return () => {
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (photos.length <= 1) return

    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % photos.length)
        setIsTransitioning(false)
      }, 400)
    }, 5000)

    return () => clearInterval(interval)
  }, [photos.length])

  const goToSlide = (index: number) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsTransitioning(false)
    }, 300)
  }

  if (photos.length === 0) {
    return (
      <div className="location-carousel-skeleton">
        <div className="skeleton-shimmer"></div>
      </div>
    )
  }

  return (
    <div className="location-carousel">
      <div className="location-carousel-wrapper">
        <div
          className={`location-carousel-image ${isTransitioning ? "transitioning" : ""}`}
          style={{ backgroundImage: `url(${photos[currentIndex]})` }}
        />
        <div className="location-carousel-overlay" />
      </div>
      
      {photos.length > 1 && (
        <div className="location-carousel-indicators">
          {photos.map((_, idx) => (
            <button
              key={idx}
              className={`carousel-indicator ${idx === currentIndex ? "active" : ""}`}
              onClick={() => goToSlide(idx)}
              aria-label={`Ir para foto ${idx + 1}`}
            />
          ))}
        </div>
      )}
      
      <div className="location-carousel-badge">
        <span className="badge-icon">📍</span>
        <span className="badge-text">Espaço Presencial</span>
      </div>
    </div>
  )
}

export default LocationCarousel
