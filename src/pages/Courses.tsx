// src/pages/Courses.tsx
import React, { useState, useEffect, useMemo } from "react"
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap"
import CourseCard from "../components/CourseCard"
import axios from "axios"
import { FaWhatsapp, FaArrowRight } from "react-icons/fa"
import { useGallery } from '../hooks/useGalleriesIndex'
import PhotoGallery from '../components/media/PhotoGallery'
import Seo from "../components/Seo"
import { buildAbsoluteUrl } from "../config/seo"
import { Link } from "react-router-dom"
import "../styles/courses-dark.css"

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
  // Novos campos para cards dinâmicos
  technologiaIcone?: string
  bgGradient?: string
  descricaoCurta?: string
}

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { gallery } = useGallery('estrutura')

  const latestFotos = gallery.fotos.slice(0, 3)

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

  const structuredData = useMemo(() => {
    if (activeCourses.length === 0) return undefined
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: activeCourses.map((curso, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: buildAbsoluteUrl(`/cursos/${curso.id}`),
        name: curso.title,
        description: curso.description,
      })),
    }
  }, [activeCourses])

  return (
    <div className="courses-page">
      <Seo
        title="Cursos de Programação Presenciais em João Pessoa | Programa AI"
        description="Veja todos os cursos presenciais e bootcamps de programação da Programa AI em João Pessoa - PB. Escolha sua trilha e fale com a gente para garantir a vaga."
        canonical="/cursos"
        structuredData={structuredData}
      />
      
      {/* Hero Section */}
      <section className="courses-hero">
        <Container>
          <h1 className="courses-hero-title">Nossos Cursos</h1>
          <p className="courses-hero-subtitle">
            Escolha sua trilha e transforme sua carreira com aulas presenciais em João Pessoa
          </p>
          <Button
            as="a"
            href={`https://wa.me/5583986608771?text=${encodeURIComponent(
              "Oi prof. Kelson, venho do site da programa AI, poderia me esclarecer algumas dúvidas?"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="courses-hero-btn"
          >
            <FaWhatsapp size={20} />
            Falar no WhatsApp
          </Button>
        </Container>
      </section>

      <Container className="courses-container">
        {/* Bloco compacto da estrutura */}
        {latestFotos.length > 0 && (
          <section className="estrutura-preview">
            <h2 className="estrutura-title">Veja nossa estrutura</h2>
            <p className="estrutura-subtitle">
              Mesão colaborativo, conforto NR17 e café sem fim — o lugar certo pra transformar ideia em código.
            </p>

            <PhotoGallery
              items={latestFotos.map(f => ({ src: f.src }))}
              maxVisible={3}
              onSeeAll={() => (window.location.href = '/estrutura')}
            />

            <div className="text-center mt-4">
              <Link to="/estrutura" className="estrutura-btn">
                Ver todas as fotos <FaArrowRight />
              </Link>
            </div>
          </section>
        )}

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
            <section className="courses-active-section">
              <h2 className="courses-section-title">Turmas Abertas</h2>
              <Row>
                {activeCourses.map(curso => (
                  <Col key={curso.id} sm={12} md={6} lg={4} className="mb-4">
                    <CourseCard {...curso} />
                  </Col>
                ))}
              </Row>
            </section>

            {/* Cursos encerrados */}
            {closedCourses.length > 0 && (
              <section className="courses-closed-section">
                <h2 className="courses-section-title closed">Vagas Encerradas</h2>
                <Row>
                  {closedCourses.map(curso => (
                    <Col key={curso.id} sm={12} md={6} lg={4} className="mb-4">
                      <div className="closed-course-wrapper">
                        <CourseCard {...curso} />
                        <div className="closed-course-overlay">
                          <span>Vagas encerradas</span>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </section>
            )}
          </>
        )}
      </Container>
    </div>
  )
}

export default Courses
