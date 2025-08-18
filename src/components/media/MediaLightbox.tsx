import React from 'react'
import { Modal, Button } from 'react-bootstrap'

export type MediaItem = {
  type: 'image' | 'video'
  src: string
  alt?: string
  caption?: string
}

type MediaLightboxProps = {
  items: MediaItem[]
  index: number | null
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

const MediaLightbox: React.FC<MediaLightboxProps> = ({ items, index, onClose, onPrev, onNext }) => {
  if (index === null) return null

  const item = items[index]

  return (
    <Modal show={index !== null} onHide={onClose} centered size='lg'>
      <Modal.Header closeButton>
        <Modal.Title>{item.caption || item.alt || (item.type === 'image' ? 'Foto' : 'Vídeo')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className='text-center'>
        {item.type === 'image' ? (
          <img src={item.src} alt={item.alt || ''} style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
        ) : (
          <video src={item.src} controls autoPlay style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
        )}
        {item.caption && <p className='text-muted mt-3'>{item.caption}</p>}
      </Modal.Body>
      <Modal.Footer className='d-flex justify-content-between'>
        <Button variant='outline-secondary' onClick={onPrev}>← Anterior</Button>
        <div className='d-flex gap-2'>
          <Button variant='secondary' onClick={onClose}>Fechar</Button>
          <Button variant='primary' onClick={onNext}>Próximo →</Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default MediaLightbox
