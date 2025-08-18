import React from 'react'
import { Container, Alert, Spinner } from 'react-bootstrap'
import { useGallery } from '../hooks/useGalleriesIndex'
import PhotoGallery from '../components/media/PhotoGallery'
import VideoGallery from '../components/media/VideoGallery'

const Estrutura: React.FC = () => {
  const { gallery, loading, error } = useGallery('estrutura')

  if (loading) {
    return (
      <Container className='py-5 text-center'>
        <Spinner animation='border' role='status' />
      </Container>
    )
  }

  if (error) {
    return (
      <Container className='py-5'>
        <Alert variant='danger'>{error}</Alert>
      </Container>
    )
  }

  return (
    <Container className='py-5'>
      <h2 className='mb-3'>Nossa Estrutura</h2>

      <p className='lead'>
        Estamos no <strong>Empresarial Eldorado</strong>, na principal avenida de João Pessoa —
        <strong> Av. Epitácio Pessoa, 1133, Sala 104</strong>. Adotamos um formato de
        <strong> coworking acadêmico</strong>, com um grande <strong>mesão de reunião</strong> que aproxima
        professores e alunos e favorece o <strong>fluxo colaborativo</strong> nas aulas práticas.
      </p>
      <p>
        O ambiente é <strong>climatizado</strong>, equipado com <strong>cadeiras ergonômicas Flexform (NR17)</strong>,
        <strong> projetor multimídia</strong> e, claro, <strong>muito café</strong> ☕ — para manter a energia e transformar
        ideias em código. Mais do que infraestrutura, cultivamos uma cultura de <strong>troca de conhecimento</strong>,
        <strong> prática intensa</strong> e <strong>proximidade com o mercado</strong>.
      </p>

      <hr className='my-4' />

      <h4 className='mb-3'>Galeria de Fotos</h4>
      <PhotoGallery items={gallery.fotos.map(f => ({ src: f.src }))} />

      <hr className='my-4' />

      <h4 className='mb-3'>Galeria de Vídeos</h4>
      <VideoGallery items={gallery.videos.map(v => ({ src: v.src }))} />
    </Container>
  )
}

export default Estrutura
