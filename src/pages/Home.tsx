// src/pages/Home.tsx
import React, { useEffect, useMemo, useState } from "react"
import { Container, Row, Col, Button, Card, Spinner, Alert } from "react-bootstrap"
import { Link } from "react-router-dom"
import { FaWhatsapp, FaMapMarkerAlt, FaArrowRight, FaCheckCircle } from "react-icons/fa"
import { SiPython, SiJavascript, SiReact, SiTypescript, SiDocker, SiKubernetes, SiPostgresql, SiMongodb, SiGit, SiLinux, SiAmazon, SiGooglecloud } from "react-icons/si"
import axios from "axios"
import Seo from "../components/Seo"
import { buildAbsoluteUrl } from "../config/seo"
import "../styles/home-dark.css"

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
  ativo?: boolean
}

const HERO_WORDS = [
  "Fullstack",
  "Java",
  "Python", 
  "Programação",
  "QA",
  "Dados",
  "Cloud",
  "React",
  "Segurança",
  "Golang",
  "Microservices",
  "Spring",
  "IA",
  "SQL",
]

const Home: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentWordIndex(prev => (prev + 1) % HERO_WORDS.length)
        setIsAnimating(false)
      }, 300)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let isMounted = true
    axios
      .get<Course[]>(`${import.meta.env.VITE_API_URL}/cursos`)
      .then(resp => {
        if (!isMounted) return
        setCourses(resp.data || [])
      })
      .catch(err => {
        console.error("Erro ao carregar cursos:", err)
        if (!isMounted) return
        setError("Não foi possível carregar os cursos agora. Tente novamente mais tarde.")
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })
    return () => { isMounted = false }
  }, [])

  const novidades = useMemo(() => {
    const ativos = courses.filter(c => c.ativo !== false)
    const toNum = (v: string) => {
      const n = Number(v)
      return Number.isNaN(n) ? -Infinity : n
    }
    return [...ativos].sort((a, b) => toNum(b.id) - toNum(a.id)).slice(0, 4)
  }, [courses])

  const structuredData = useMemo(() => {
    if (novidades.length === 0) return undefined
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: novidades.map((curso, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: buildAbsoluteUrl(`/cursos/${curso.id}`),
        name: curso.title,
        description: curso.description,
      })),
    }
  }, [novidades])

  return (
    <>
      <Seo
        title="Cursos de Programação Presencial em João Pessoa | Programa AI"
        description="Cursos presenciais e bootcamps intensivos de programação em João Pessoa (PB). Turmas reduzidas, professores de mercado e muita prática com IA."
        canonical="/"
        structuredData={structuredData}
      />

      {/* HERO SECTION - 21st.dev Style */}
      <section className="hero-section">
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        
        <Container className="hero-container">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            <span>Cursos Presenciais em João Pessoa</span>
          </div>

          <h1 className="hero-title">
            Aprenda{" "}
            <span className={`hero-word ${isAnimating ? 'animating' : ''}`}>
              {HERO_WORDS[currentWordIndex]}
            </span>
            <br />
            na prática, com mentoria
          </h1>

          <p className="hero-subtitle">
            Turmas reduzidas, professores de mercado e muita prática. 
            Saia do zero ao profissional com acompanhamento personalizado.
          </p>

          <div className="hero-buttons">
            <Link to="/cursos" className="hero-btn-primary">
              Ver Cursos <FaArrowRight />
            </Link>
            <Button
              as="a"
              href={`https://wa.me/5583986608771?text=${encodeURIComponent(
                "Oi prof. Kelson, venho do site da programa AI, poderia me esclarecer algumas dúvidas?"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-btn-secondary"
            >
              <FaWhatsapp /> Falar no WhatsApp
            </Button>
          </div>

          <div className="hero-location">
            <FaMapMarkerAlt className="hero-location-icon" />
            <span>Av. Epitácio Pessoa, 1133 - João Pessoa/PB</span>
          </div>
        </Container>
      </section>

      {/* TECH ICONS SECTION */}
      <section className="tech-section">
        <Container>
          <p className="tech-label">Tecnologias que ensinamos</p>
          <div className="tech-icons">
            <SiPython title="Python" />
            <SiJavascript title="JavaScript" />
            <SiTypescript title="TypeScript" />
            <SiReact title="React" />
            <SiDocker title="Docker" />
            <SiKubernetes title="Kubernetes" />
            <SiPostgresql title="PostgreSQL" />
            <SiMongodb title="MongoDB" />
            <SiGit title="Git" />
            <SiLinux title="Linux" />
            <SiAmazon title="AWS" />
            <SiGooglecloud title="Google Cloud" />
          </div>
        </Container>
      </section>

      {/* BENEFITS SECTION */}
      <section className="benefits-section">
        <Container>
          <div className="benefits-header">
            <h2 className="section-title">Por que estudar presencial?</h2>
            <p className="section-subtitle">
              Vantagens que fazem a diferença na sua jornada de aprendizado
            </p>
          </div>

          <Row className="benefits-grid">
            <Col md={4} className="benefit-card">
              <div className="benefit-icon">🎯</div>
              <h3>Foco Total</h3>
              <p>Ambiente preparado para você se concentrar, sem distrações de casa</p>
            </Col>
            <Col md={4} className="benefit-card">
              <div className="benefit-icon">�‍🏫</div>
              <h3>Mentoria Direta</h3>
              <p>Tire dúvidas na hora, sem ficar dias esperando resposta</p>
            </Col>
            <Col md={4} className="benefit-card">
              <div className="benefit-icon">🤝</div>
              <h3>Networking</h3>
              <p>Construa conexões com colegas que podem virar parceiros de trabalho</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* COURSES SECTION */}
      <section className="courses-section">
        <Container>
          <div className="courses-header">
            <h2 className="section-title">Próximas Turmas</h2>
            <p className="section-subtitle">
              Cursos com vagas abertas para você começar agora
            </p>
          </div>

          {loading && (
            <div className="text-center my-5">
              <Spinner animation="border" role="status" />
            </div>
          )}

          {error && (
            <Alert variant="danger" className="my-4">{error}</Alert>
          )}

          {!loading && !error && novidades.length === 0 && (
            <p className="text-center text-muted">Sem turmas abertas no momento. Volte em breve! 🙂</p>
          )}

          <Row className="courses-grid">
            {!loading && !error && novidades.map(curso => (
              <Col lg={6} key={curso.id} className="mb-4">
                <Card className="course-card-modern">
                  <Card.Body>
                    <div className="course-card-header">
                      <img
                        src={curso.profFoto}
                        alt={curso.professor}
                        className="course-prof-photo"
                      />
                      <div className="course-card-info">
                        <Card.Title className="course-card-title">{curso.title}</Card.Title>
                        <span className="course-card-prof">Prof. {curso.professor}</span>
                      </div>
                    </div>
                    
                    <p className="course-card-desc">{curso.description.slice(0, 100)}...</p>
                    
                    <div className="course-card-meta">
                      <span className="course-meta-item">
                        <FaCheckCircle /> {curso.duration}
                      </span>
                      <span className="course-meta-item">
                        <FaCheckCircle /> {curso.modalidade}
                      </span>
                    </div>

                    <div className="course-card-footer">
                      <span className="course-card-price">{curso.price}</span>
                      <Link to={`/cursos/${curso.id}`} className="course-card-btn">
                        Ver detalhes <FaArrowRight />
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="text-center mt-4">
            <Link to="/cursos" className="btn-see-all">
              Ver todos os cursos <FaArrowRight />
            </Link>
          </div>
        </Container>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <Container>
          <div className="cta-content">
            <h2 className="cta-title">Pronto para começar?</h2>
            <p className="cta-subtitle">
              Fale com a gente e descubra qual curso é ideal para você
            </p>
            <div className="cta-buttons">
              <Button
                as="a"
                href={`https://wa.me/5583986608771?text=${encodeURIComponent(
                  "Oi prof. Kelson, venho do site da programa AI, poderia me esclarecer algumas dúvidas?"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-btn-primary"
              >
                <FaWhatsapp /> Falar no WhatsApp
              </Button>
              <Link to="/cursos" className="cta-btn-secondary">
                Explorar Cursos
              </Link>
            </div>

            <div className="cta-location">
              <FaMapMarkerAlt />
              <div>
                <strong>Programa AI</strong>
                <br />
                Empresarial Eldorado, Sala 104
                <br />
                Av. Epitácio Pessoa, 1133 - João Pessoa/PB
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

export default Home
