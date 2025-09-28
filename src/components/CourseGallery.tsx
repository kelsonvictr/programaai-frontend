import { useEffect, useMemo, useState } from "react"
import { Modal } from "react-bootstrap"
interface GalleryPhoto {
  src: string
}

interface GalleryResponse {
  photos?: GalleryPhoto[]
}

const loadPhotosFromJson = async (signal?: AbortSignal): Promise<string[]> => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}course-details-gallery.json`, {
      cache: "no-store",
      signal,
    })
    if (!response.ok) return []
    const payload = (await response.json()) as GalleryResponse
    return (payload.photos ?? [])
      .map(photo => photo.src)
      .filter(Boolean)
  } catch (error) {
    if ((error as Error).name === "AbortError") return []
    console.warn("Falha ao carregar galeria do curso", error)
    return []
  }
}

const CourseGallery = () => {
  const [photos, setPhotos] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const [startIndex, setStartIndex] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false

    loadPhotosFromJson(controller.signal).then(found => {
      if (!cancelled) {
        setPhotos(found)
        setStartIndex(0)
      }
    })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const mq = window.matchMedia("(min-width: 992px)")
    const update = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsDesktop(event.matches)
    }

    update(mq)

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update)
      return () => mq.removeEventListener("change", update)
    }

    mq.addListener(update)
    return () => mq.removeListener(update)
  }, [])

  useEffect(() => {
    if (photos.length === 0) return
    const maxVisible = isDesktop ? 6 : 3
    if (photos.length <= maxVisible) {
      setStartIndex(0)
      return
    }

    const interval = setInterval(() => {
      setStartIndex(prev => (prev + 1) % photos.length)
    }, 3500)

    return () => clearInterval(interval)
  }, [photos, isDesktop])

  const marqueeItems = useMemo(() => {
    if (photos.length === 0) return []

    const maxVisible = isDesktop ? 6 : 3
    if (photos.length <= maxVisible) return [...photos]

    const result: string[] = []
    for (let i = 0; i < maxVisible; i++) {
      const index = (startIndex + i) % photos.length
      result.push(photos[index])
    }
    return result
  }, [photos, isDesktop, startIndex])

  if (photos.length === 0) {
    return null
  }

  return (
    <div className="course-gallery-wrapper mt-4">
      <div className="course-gallery-grid">
        {marqueeItems.map(src => {
          const absoluteIndex = photos.indexOf(src)
          return (
            <button
              key={src}
              type="button"
              className="course-gallery-card"
              onClick={() => setActiveIndex(absoluteIndex === -1 ? 0 : absoluteIndex)}
            >
              <img src={src} alt="Ambiente e bastidores da Programa AI" loading="lazy" decoding="async" />
            </button>
          )
        })}
      </div>

      <Modal
        show={activeIndex !== null}
        onHide={() => setActiveIndex(null)}
        centered
        size="lg"
        contentClassName="bg-dark text-white border-0"
      >
        <Modal.Body className="p-0">
          {activeIndex !== null && (
            <img
              src={photos[activeIndex]}
              alt="Foto em destaque da experiência Programa AI"
              className="w-100"
              style={{ objectFit: "contain", maxHeight: "80vh" }}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default CourseGallery
