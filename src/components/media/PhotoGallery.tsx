import React, { useMemo, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import MediaLightbox, { type MediaItem } from './MediaLightbox'
import styles from './gallery.module.css'

type PhotoGalleryProps = {
  items: { src: string, alt?: string, caption?: string }[]
  maxVisible?: number
  onSeeAll?: () => void
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ items, maxVisible, onSeeAll }) => {
  const [current, setCurrent] = useState<number | null>(null)

  const mediaItems: MediaItem[] = useMemo(
    () => items.map(i => ({ type: 'image', src: i.src, alt: i.alt, caption: i.caption })),
    [items]
  )

  const visible = typeof maxVisible === 'number' ? items.slice(0, maxVisible) : items

  const open = (idx: number) => setCurrent(idx)
  const close = () => setCurrent(null)
  const prev = () => setCurrent(c => (c === null ? c : (c - 1 + mediaItems.length) % mediaItems.length))
  const next = () => setCurrent(c => (c === null ? c : (c + 1) % mediaItems.length))

  return (
    <>
      <Row xs={2} md={3} lg={4} className='g-3'>
        {visible.map((item, idx) => (
          <Col key={idx}>
            <div className={styles.thumb} onClick={() => open(idx)} role='button' aria-label={item.alt || 'foto'}>
              <img src={item.src} alt={item.alt || ''} loading='lazy' className={styles.img} />
              {item.caption && <div className={styles.caption}>{item.caption}</div>}
            </div>
          </Col>
        ))}
        {typeof maxVisible === 'number' && items.length > maxVisible && (
          <Col className='d-flex align-items-center justify-content-center'>
            <button className='btn btn-outline-primary' onClick={onSeeAll}>Ver todas as fotos</button>
          </Col>
        )}
      </Row>

      <MediaLightbox items={mediaItems} index={current} onClose={close} onPrev={prev} onNext={next} />
    </>
  )
}

export default PhotoGallery
