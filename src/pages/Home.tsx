// src/pages/Home.tsx
import React, { useEffect, useMemo, useState } from "react"
import { Container, Row, Col, Button, Card, Spinner, Alert } from "react-bootstrap"
import { Link } from "react-router-dom"
import { FaWhatsapp } from "react-icons/fa"
import BannerCarousel from "../components/BannerCarousel"
import axios from "axios"

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

const Home: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  // pega só cursos ativos (se 'ativo' vier ausente, considera ativo)
  const novidades = useMemo(() => {
    const ativos = courses.filter(c => c.ativo !== false)
    const toNum = (v: string) => {
      const n = Number(v)
      return Number.isNaN(n) ? -Infinity : n
    }
    return [...ativos].sort((a, b) => toNum(b.id) - toNum(a.id)).slice(0, 4)
  }, [courses])

  return (
    <>
      <BannerCarousel />

      <Container className="py-2">
        <Row className="align-items-start">
          <Col md={6} className="mb-4 mb-md-0 text-md-start text-center">
            <h3>Muita Programação, IA e Café! ☕👩‍💻👨‍💻</h3>

            <Button
              as="a"
              href={`https://wa.me/5583986608771?text=${encodeURIComponent(
                "Oi prof. Kelson, venho do site da programa AI, poderia me esclarecer algumas dúvidas?"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="success"
              size="lg"
            >
              <FaWhatsapp size={20} className="me-2" />
              Fale conosco pelo WhatsApp
            </Button>

            <Row
              className="my-4 text-center justify-content-center"
              style={{ gap: "8px", flexWrap: "nowrap", overflowX: "auto" }}
            >
              <Col xs={6} md={6} style={{ flex: "0 0 auto", maxWidth: "300px" }}>
                <video
                  src="/videos/sala-web.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="rounded shadow"
                  style={{ maxHeight: 250, width: "100%" }}
                />
              </Col>

              <Col xs={6} md={6} style={{ flex: "0 0 auto", maxWidth: "300px" }}>
                <video
                  src="/videos/video-2-web.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="rounded shadow"
                  style={{ maxHeight: 250, width: "100%" }}
                />
              </Col>
            </Row>

            <p className="lead">
              Cursos livres e bootcamps que te preparam para o mercado!
              Sem lenga-lenga, muita prática, IA e didática!
            </p>

            <p className="mt-3 text-muted d-flex align-items-center justify-content-md-start justify-content-center">
              <span role="img" aria-label="map">📍</span>
              <a
                href="https://www.google.com/maps/place/Empresarial+Eldorado/@-7.119502,-34.8602648,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="ms-2 text-decoration-none"
                style={{ color: "var(--color-secondary)" }}
              >
                Programa AI – Empresarial Eldorado, Sala 104<br />
                Av. Pres. Epitácio Pessoa – João Pessoa/PB
              </a>
            </p>

            <Link to="/cursos" className="btn btn-primary btn-lg">
              Conheça os Cursos
            </Link>
          </Col>

          <Col md={6}>
            <h3 className="mb-4">Novidades</h3>

            {loading && (
              <div className="text-center my-4">
                <Spinner animation="border" role="status" />
              </div>
            )}

            {error && (
              <Alert variant="danger">{error}</Alert>
            )}

            {!loading && !error && novidades.length === 0 && (
              <p className="text-muted">Sem novidades no momento. Volte em breve! 🙂</p>
            )}

            {!loading && !error && novidades.map(curso => (
              <Card key={curso.id} className="mb-3 shadow-sm">
                <Card.Body className="d-flex">
                  {/* Foto do professor */}
                  <img
                    src={curso.profFoto}
                    alt={curso.professor}
                    style={{
                      width: 64,
                      height: 64,
                      objectFit: "cover",
                      borderRadius: "50%",
                      marginRight: "1rem"
                    }}
                  />

                  <div className="flex-grow-1">
                    <Card.Title className="h6 mb-1">{curso.title}</Card.Title>
                    <small className="text-muted d-block mb-1">{curso.duration}</small>
                    <p className="mb-2">
                      {curso.description.slice(0, 60)}...
                    </p>
                    <Link
                      to={`/cursos/${curso.id}`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      Ver curso
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </Col>
        </Row>

        <Row className="mt-5">
          <Col>
            <Card className="shadow-sm">
              <Card.Body className="text-center">
                <Card.Title>Onde Estamos?</Card.Title>
                <Card.Text className="mb-4">
                  <span role="img" aria-label="local">📍</span>{" "}
                  Av. Pres. Epitácio Pessoa, 1133 – Estados, João Pessoa – PB<br />
                  (Empresarial Eldorado – Sala 104)
                </Card.Text>
                <Button
                  as="a"
                  href={`https://wa.me/5583986608771?text=${encodeURIComponent(
                    "Oi prof. Kelson, venho do site da programa AI, poderia me esclarecer algumas dúvidas?"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="success"
                  size="lg"
                >
                  <FaWhatsapp size={20} className="me-2" />
                  Fale conosco pelo WhatsApp
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Home
