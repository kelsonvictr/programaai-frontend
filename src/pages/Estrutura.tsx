import React from 'react'
import { Container, Alert, Spinner } from 'react-bootstrap'
import { useGallery } from '../hooks/useGalleriesIndex'
import PhotoGallery from '../components/media/PhotoGallery'
import VideoGallery from '../components/media/VideoGallery'
import { FaMapMarkerAlt, FaCoffee, FaWifi, FaSnowflake, FaChair } from 'react-icons/fa'
import '../styles/estrutura-dark.css'

const Estrutura: React.FC = () => {
  const { gallery, loading, error } = useGallery('estrutura')

  if (loading) {
    return (
      <div className='estrutura-page'>
        <Container className='py-5 text-center'>
          <Spinner animation='border' role='status' />
        </Container>
      </div>
    )
  }

  if (error) {
    return (
      <div className='estrutura-page'>
        <Container className='py-5'>
          <Alert variant='danger'>{error}</Alert>
        </Container>
      </div>
    )
  }

  return (
    <div className='estrutura-page'>
      {/* Hero Section */}
      <section className='estrutura-hero'>
        <Container>
          <h1 className='estrutura-hero-title'>Nossa Estrutura</h1>
          <p className='estrutura-hero-subtitle'>
            Um espaço pensado para você aprender de verdade, com conforto e foco total
          </p>
        </Container>
      </section>

      <Container className='estrutura-container'>
        {/* Location Card */}
        <div className='estrutura-location-card'>
          <div className='location-icon'>
            <FaMapMarkerAlt />
          </div>
          <div className='location-content'>
            <h3>Empresarial Eldorado, Sala 104</h3>
            <p>Av. Epitácio Pessoa, 1133 - João Pessoa/PB</p>
            <a 
              href='https://www.google.com/maps/place/Empresarial+Eldorado/@-7.119502,-34.8602648,17z'
              target='_blank'
              rel='noopener noreferrer'
              className='location-link'
            >
              Ver no Google Maps
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className='estrutura-features'>
          <div className='feature-item'>
            <FaSnowflake className='feature-icon' />
            <span>Ambiente Climatizado</span>
          </div>
          <div className='feature-item'>
            <FaChair className='feature-icon' />
            <span>Cadeiras Ergonômicas NR17</span>
          </div>
          <div className='feature-item'>
            <FaWifi className='feature-icon' />
            <span>Internet de Alta Velocidade</span>
          </div>
          <div className='feature-item'>
            <FaCoffee className='feature-icon' />
            <span>Café à Vontade</span>
          </div>
        </div>

        {/* Description */}
        <div className='estrutura-description'>
          <p>
            Adotamos um formato de <strong>coworking acadêmico</strong>, com um grande <strong>mesão de reunião</strong> que aproxima
            professores e alunos e favorece o <strong>fluxo colaborativo</strong> nas aulas práticas.
          </p>
          <p>
            Mais do que infraestrutura, cultivamos uma cultura de <strong>troca de conhecimento</strong>,
            <strong> prática intensa</strong> e <strong>proximidade com o mercado</strong>.
          </p>
        </div>

        {/* Photo Gallery */}
        <section className='estrutura-gallery-section'>
          <h2 className='gallery-section-title'>Galeria de Fotos</h2>
          <PhotoGallery items={gallery.fotos.map(f => ({ src: f.src }))} />
        </section>

        {/* Video Gallery */}
        <section className='estrutura-gallery-section'>
          <h2 className='gallery-section-title'>Galeria de Vídeos</h2>
          <VideoGallery items={gallery.videos.map(v => ({ src: v.src }))} />
        </section>
      </Container>
    </div>
  )
}

export default Estrutura
