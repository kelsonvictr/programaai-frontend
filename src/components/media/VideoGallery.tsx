import React, { useMemo, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import MediaLightbox, { type MediaItem } from './MediaLightbox'
import styles from './gallery.module.css'

type VideoItem = {
  src: string
  poster?: string
  caption?: string
}

type VideoGalleryProps = {
  items: VideoItem[]
  maxVisible?: number
  onSeeAll?: () => void
}

const VideoGallery: React.FC<VideoGalleryProps> = ({ items, maxVisible, onSeeAll }) => {
  const [current, setCurrent] = useState<number | null>(null)

  const mediaItems: MediaItem[] = useMemo(
    () => items.map(v => ({ type: 'video', src: v.src, caption: v.caption })),
    [items]
  )

  const visible = typeof maxVisible === 'number' ? items.slice(0, maxVisible) : items

  const open = (idx: number) => setCurrent(idx)
  const close = () => setCurrent(null)
  const prev = () => setCurrent(c => (c === null ? c : (c - 1 + mediaItems.length) % mediaItems.length))
  const next = () => setCurrent(c => (c === null ? c : (c + 1) % mediaItems.length))

  return (
    <>
      <Row xs={1} md={2} lg={3} className='g-3'>
        {visible.map((v, idx) => (
          <Col key={idx}>
            <div className={styles.thumb} onClick={() => open(idx)} role='button' aria-label={v.caption || 'vídeo'}>
              {v.poster ? (
                <img src={v.poster} alt={v.caption || 'vídeo'} loading='lazy' className={styles.img} />
              ) : (
                <video src={v.src} className={styles.img} muted preload='metadata' />
              )}
              <div className={styles.play}>▶</div>
              {v.caption && <div className={styles.caption}>{v.caption}</div>}
            </div>
          </Col>
        ))}
        {typeof maxVisible === 'number' && items.length > maxVisible && (
          <Col className='d-flex align-items-center justify-content-center'>
            <button className='btn btn-outline-primary' onClick={onSeeAll}>Ver todos os vídeos</button>
          </Col>
        )}
      </Row>

      <MediaLightbox items={mediaItems} index={current} onClose={close} onPrev={prev} onNext={next} />
    </>
  )
}

export default VideoGallery
