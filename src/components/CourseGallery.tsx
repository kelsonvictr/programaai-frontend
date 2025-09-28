import { useEffect, useMemo, useRef, useState } from "react"
import { Modal } from "react-bootstrap"

const MAX_IMAGE_INDEX = 100

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

  for (let i = 1; i <= MAX_IMAGE_INDEX; i++) {
    if (signal?.aborted) break
    const candidate = `${base}${i}.jpg`
    const exists = await checkImageExists(candidate)
    if (signal?.aborted) break
    if (!exists) break
    found.push(candidate)
  }

  return found.reverse()
}

const CourseGallery = () => {
  const [photos, setPhotos] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const marqueeRef = useRef<HTMLDivElement | null>(null)

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
    return photos
  }, [photos])

  if (photos.length === 0) {
    return null
  }

  useEffect(() => {
    if (photos.length <= 1) {
      const marquee = marqueeRef.current
      if (marquee) marquee.style.transform = "translateX(0)"
      return
    }

    const marquee = marqueeRef.current
    if (!marquee) return

    let position = 0
    let animationFrame = 0
    let lastTime = performance.now()
    const speedPxPerSecond = 180

    const getGap = () => {
      const styles = window.getComputedStyle(marquee)
      const gap = parseFloat(styles.columnGap || styles.gap || "0")
      return Number.isFinite(gap) ? gap : 0
    }

    const step = (now: number) => {
      const delta = now - lastTime
      lastTime = now
      position += (speedPxPerSecond * delta) / 1000

      let loopSafety = 0
      let firstChild = marquee.firstElementChild as HTMLElement | null
      const gap = getGap()
      while (firstChild && loopSafety < 50) {
        const childWidth = firstChild.offsetWidth + gap
        if (childWidth === 0 || position < childWidth) break
        position -= childWidth
        marquee.appendChild(firstChild)
        firstChild = marquee.firstElementChild as HTMLElement | null
        loopSafety += 1
      }

      marquee.style.transform = `translateX(-${position}px)`
      animationFrame = requestAnimationFrame(step)
    }

    animationFrame = requestAnimationFrame(step)

    return () => cancelAnimationFrame(animationFrame)
  }, [photos])

  return (
    <div className="course-gallery-wrapper mt-4">
      <div className="course-gallery-track">
        <div
          ref={marqueeRef}
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
