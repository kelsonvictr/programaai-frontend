// src/pages/Courses.tsx
import React, { useState, useEffect } from "react"
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap"
import CourseCard from "../components/CourseCard"
import axios from "axios"
import { FaWhatsapp } from "react-icons/fa"
import { useGallery } from '../hooks/useGalleriesIndex'
import PhotoGallery from '../components/media/PhotoGallery'
import VideoGallery from '../components/media/VideoGallery'

interface Course {
  id: string
  title: string
  description: string
  duration: string
  price: string
  obsPrice?: string
  imageUrl: string
  bannerSite: string
  bannerMobile: string
  professor: string
  profFoto: string
  linkedin: string
  datas: string[]
  horario: string
  modalidade: string
  bio: string
  prerequisitos?: string[]
  publicoAlvo?: string[]
  oQueVaiAprender?: string[]
  modulos?: string[]
  ativo: boolean
}

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { gallery } = useGallery('estrutura')

  useEffect(() => {
    axios
      .get<Course[]>(`${import.meta.env.VITE_API_URL}/cursos`)
      .then(resp => setCourses(resp.data))
      .catch(err => {
        console.error("Erro ao carregar cursos:", err)
        setError("Não foi possível carregar a lista de cursos. Tente novamente mais tarde.")
      })
      .finally(() => setLoading(false))
  }, [])

  const activeCourses = courses.filter(c => c.ativo)
  const closedCourses = courses.filter(c => !c.ativo)

  return (
    <Container className="py-5">
      <h2 className="mb-4">Nossos Cursos</h2>

      <Button
        as="a"
        href={`https://wa.me/5583986608771?text=${encodeURIComponent(
          "Oi prof. Kelson, venho do site da programa AI, poderia me esclarecer algumas dúvidas?"
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        variant="success"
        size="lg"
        className="mb-4"
      >
        <FaWhatsapp size={20} className="me-2" />
        Fala com a gente pelo WhatsApp
      </Button>

      <h5 className='mt-5'>Veja nossa estrutura</h5>
      <PhotoGallery
        items={gallery.fotos.map(f => ({ src: f.src }))}
        maxVisible={3}
        onSeeAll={() => window.location.href = '/estrutura'}
      />
      <div className='mt-3' />
      <VideoGallery
        items={gallery.videos.map(v => ({ src: v.src }))}
        maxVisible={1}
        onSeeAll={() => window.location.href = '/estrutura'}
      />

      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" />
        </div>
      )}

      {error && (
        <Alert variant="danger">{error}</Alert>
      )}

      {!loading && !error && (
        <>
          {/* Cursos ativos */}
          <Row>
            {activeCourses.map(curso => (
              <Col key={curso.id} sm={12} md={6} lg={4} className="mb-4">
                <CourseCard {...curso} />
              </Col>
            ))}
          </Row>

          {/* Cursos encerrados */}
          {closedCourses.length > 0 && (
            <>
              <h3 className="mt-5 text-center text-muted">Vagas Encerradas</h3>
              <Row>
                {closedCourses.map(curso => (
                  <Col key={curso.id} sm={12} md={6} lg={4} className="mb-4">
                    <div className="position-relative">
                      <CourseCard {...curso} />
                      {/* Sobreposição visual */}
                      <div
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{
                          backgroundColor: "rgba(0,0,0,0.6)",
                          pointerEvents: "none"  // permite clonck-through
                        }}
                      >
                        <span className="text-white fs-4">Vagas encerradas</span>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </>
          )}
        </>
      )}
    </Container>
  )
}

export default Courses
