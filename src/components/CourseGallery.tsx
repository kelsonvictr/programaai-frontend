import { useEffect, useMemo, useState } from "react"
import { Modal } from "react-bootstrap"

const MAX_IMAGE_INDEX = 100
const EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"]

const checkImageExists = (src: string): Promise<boolean> => {
  return new Promise(resolve => {
    const img = new Image()
    const cleanup = () => {
      img.onload = null
      img.onerror = null
    }
    img.onload = () => {
      cleanup()
      resolve(true)
    }
    img.onerror = () => {
      cleanup()
      resolve(false)
    }
    img.decoding = "async"
    img.loading = "eager"
    img.src = src
  })
}

const loadSequentialPhotos = async (signal?: AbortSignal): Promise<string[]> => {
  const base = `${import.meta.env.BASE_URL}galeria-course-details/`
  const found: string[] = []

  for (let i = MAX_IMAGE_INDEX; i >= 1; i--) {
    if (signal?.aborted) break

    let matched = false
    for (const ext of EXTENSIONS) {
      const candidate = `${base}${i}.${ext}`
      const exists = await checkImageExists(candidate)
      if (signal?.aborted) break
      if (exists) {
        found.push(candidate)
        matched = true
        break
      }
    }

    if (!matched) continue
  }

  return found
}

const CourseGallery = () => {
  const [photos, setPhotos] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false

    loadSequentialPhotos(controller.signal).then(found => {
      if (!cancelled) {
        setPhotos(found)
      }
    })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  const marqueeItems = useMemo(() => {
    if (photos.length === 0) return []
    if (photos.length === 1) return photos
    return [...photos, ...photos]
  }, [photos])

  if (photos.length === 0) {
    return null
  }

  return (
    <div className="course-gallery-wrapper mt-4">
      <div className="course-gallery-track">
        <div
          className={`course-gallery-marquee ${photos.length <= 1 ? "course-gallery-marquee--static" : ""}`}
        >
          {marqueeItems.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              className="course-gallery-thumb"
              onClick={() => setActiveIndex(index % photos.length)}
            >
              <img src={src} alt="Ambiente e bastidores da Programa AI" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
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
