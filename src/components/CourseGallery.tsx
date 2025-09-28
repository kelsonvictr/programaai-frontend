import { useEffect, useMemo, useState } from "react"
import { Modal } from "react-bootstrap"

interface GalleryPhoto {
  src: string
  size?: number
  mtime?: number
}

interface GalleryPayload {
  photos?: GalleryPhoto[]
}

const fetchGallery = async (signal?: AbortSignal): Promise<string[]> => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}course-details-gallery.json`, { signal })
    if (!response.ok) return []
    const payload = (await response.json()) as GalleryPayload
    return (payload.photos ?? []).map(photo => photo.src)
  } catch (error) {
    if ((error as Error).name === "AbortError") return []
    console.warn("Falha ao carregar galeria do curso", error)
    return []
  }
}

const CourseGallery = () => {
  const [photos, setPhotos] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchGallery(controller.signal).then(found => setPhotos(found))
    return () => controller.abort()
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
              <img
                src={encodeURI(src)}
                alt="Ambiente e bastidores da Programa AI"
                loading="lazy"
                decoding="async"
              />
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
