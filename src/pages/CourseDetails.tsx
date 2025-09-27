// src/pages/CourseDetails.tsx
import React, { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  Container,
  Card,
  Button,
  Alert,
  Spinner,
  Ratio,
  Modal,
  Row,
  Col
} from "react-bootstrap"
import axios from "axios"
import { FaLinkedin, FaWhatsapp, FaPlay } from "react-icons/fa"
import ParcelamentoModal from "../components/ParcelamentoModal"
import { calcularValores } from "../utils/payment"

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
  video?: string
  publicoAlvo?: string[]
  oQueVaiAprender?: string[]
  modulos?: string[]
  prerequisitos?: string[]
  ativo: boolean
}

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showParcelamento, setShowParcelamento] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    if (!id) {
      navigate("/cursos")
      return
    }
    axios
      .get<Course>(`${import.meta.env.VITE_API_URL}/cursos`, {
        params: { id }
      })
      .then(resp => setCourse(resp.data))
      .catch(err => {
        console.error("Erro ao buscar curso:", err)
        setError("Não foi possível carregar os detalhes do curso.")
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  useEffect(() => {
    if (typeof window === "undefined") return

    const mediaQuery = window.matchMedia("(min-width: 992px)")

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsDesktop(event.matches)
    }

    handleChange(mediaQuery)

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }

    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" />
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={() => navigate("/cursos")} variant="secondary">
          Voltar para Cursos
        </Button>
      </Container>
    )
  }

  if (!course) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Curso não encontrado.</Alert>
        <Button onClick={() => navigate("/cursos")} variant="secondary">
          Voltar para Cursos
        </Button>
      </Container>
    )
  }

  const videoSrc = course.video ? `/videos-cursos/${course.video}` : null
  const videoPoster = course.bannerMobile || course.bannerSite
  const videoCaption = "Assita o nosso vídeo de apresentação do curso."
  const showCombinedLayout = Boolean(videoSrc && isDesktop)
  const handleOpenVideo = () => setShowVideoModal(true)

  const desktopVideoCard = videoSrc ? (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleOpenVideo}
      onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          handleOpenVideo()
        }
      }}
      aria-label="Assistir apresentação do curso"
      className="border-0 shadow-lg text-white"
      style={{
        width: "100%",
        maxWidth: "380px",
        borderRadius: "24px",
        background: "linear-gradient(160deg, #0f172a 0%, #233454 50%, #3b4b75 100%)",
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <Card.Body className="p-4 d-flex flex-column gap-3">
        <div
          className="position-relative rounded-4 overflow-hidden"
          style={{ background: "#000", minHeight: "420px" }}
        >
          <img
            src={videoPoster}
            alt={`Assista o vídeo do curso ${course.title}`}
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{
              background: "linear-gradient(180deg, rgba(15,23,42,0) 40%, rgba(15,23,42,0.85) 100%)",
            }}
          />
          <div
            className="position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center"
            style={{
              width: "84px",
              height: "84px",
              borderRadius: "50%",
              background: "rgba(15, 23, 42, 0.7)",
              border: "3px solid rgba(255,255,255,0.75)",
            }}
          >
            <FaPlay size={32} color="#fff" style={{ marginLeft: "6px" }} />
          </div>
        </div>
        <div className="d-flex flex-column gap-2">
          <span
            className="text-white text-uppercase small fw-semibold"
            style={{ letterSpacing: "0.08em" }}
          >
            APRESENTAÇÃO DO CURSO
          </span>
          <span className="text-white-50 small">{videoCaption}</span>
        </div>
        <div className="d-flex align-items-center justify-content-between">
          <span className="badge bg-warning text-dark text-uppercase fw-semibold">Assistir agora</span>
          <span className="text-white-50 small d-flex align-items-center gap-2">
            Clique e veja
            <FaPlay size={14} className="opacity-75" />
          </span>
        </div>
      </Card.Body>
    </Card>
  ) : null

  const inlineVideoCard = videoSrc ? (
    <Card
      className="border-0 shadow-sm overflow-hidden bg-dark text-white mx-auto mx-md-0"
      style={{ maxWidth: "460px" }}
    >
      <Card.Body className="p-0">
        <Ratio aspectRatio={100 * (16 / 9)}>
          <video
            src={videoSrc}
            controls
            preload="metadata"
            poster={videoPoster}
            className="w-100 h-100"
            style={{ objectFit: "contain", backgroundColor: "#000" }}
            playsInline
          >
            Seu navegador não suporta a reprodução de vídeo.
          </video>
        </Ratio>
      </Card.Body>
      <Card.Footer className="bg-dark text-white-50">{videoCaption}</Card.Footer>
    </Card>
  ) : null

  const videoModal = videoSrc ? (
    <Modal
      show={showVideoModal}
      onHide={() => setShowVideoModal(false)}
      centered
      size="lg"
      contentClassName="bg-dark text-white border-0"
    >
      <Modal.Header closeButton closeVariant="white" className="border-0">
        <Modal.Title className="fs-6 text-uppercase text-white-50">
          🎥 Apresentação do Curso
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <Ratio aspectRatio={100 * (16 / 9)}>
          <video
            src={videoSrc}
            controls
            autoPlay
            preload="metadata"
            poster={videoPoster}
            className="w-100 h-100"
            style={{ objectFit: "contain", backgroundColor: "#000" }}
            playsInline
          >
            Seu navegador não suporta a reprodução de vídeo.
          </video>
        </Ratio>
      </Modal.Body>
    </Modal>
  ) : null

  return (
    <Container className="py-5">
      <Card className="shadow-sm position-relative overflow-hidden">
        {/* Ribbon de Vagas Encerradas */}
        {!course.ativo && (
          <div
            style={{
              position: "absolute",
              top: "1rem",
              left: "-2rem",
              background: "#dc3545",
              color: "#fff",
              padding: "0.5rem 3rem",
              transform: "rotate(-45deg)",
              zIndex: 10,
              fontWeight: "bold",
            }}
          >
            VAGAS ENCERRADAS
          </div>
        )}

        {/* Banner / Imagem */}
        <Card.Img
          variant="top"
          src={course.imageUrl}
          alt={`Imagem do curso ${course.title}`}
          style={{ maxHeight: "530px", objectFit: "cover" }}
        />

        <Card.Body>
          <Card.Title as="h2">{course.title}</Card.Title>

          <p className="text-muted">
            <strong>Modalidade:</strong> {course.modalidade} <br />
            <strong>Datas:</strong> {course.datas.join(" | ")} <br />
            <strong>Horário:</strong> {course.horario} <br />
            <strong>Duração:</strong> {course.duration} <br />
            <strong>Investimento:</strong> {course.price}
            {course.obsPrice && <span> ({course.obsPrice})</span>} <br />
            <strong>Formas de Pagamento:</strong> Pix ou Cartão de Crédito (em até 12x)
          </p>

          {/* Destaque dos valores parcelados */}
          {(() => {
            const { base, parcela12 } = calcularValores(course.price)
            return (
              <div className="mt-3 p-3 bg-light border rounded">
                <p className="mb-1">
                  💰 <strong>À vista no PIX:</strong> R$ {base.toFixed(2).replace(".", ",")}
                </p>
                <p className="mb-0 text-success fw-bold">
                  🚀 💳  Ou em até 12x de R$ {parcela12.toFixed(2).replace(".", ",")}
                </p>
              </div>
            )
          })()}

          <Button
            as="a"
            href={`https://wa.me/5583986608771?text=${encodeURIComponent(
              "Oi prof. Kelson, venho do site da programa AI, poderia me esclarecer algumas dúvidas?"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            variant="success"
            className="mb-3"
          >
            <FaWhatsapp className="me-2" /> Fala com a gente pelo WhatsApp
          </Button>

          <hr />

          {showCombinedLayout ? (
            <Row className="g-5 align-items-start">
              <Col lg={7}>
                <div className="d-flex flex-column gap-4 pe-lg-4">
                  <div>
                    <h5 className="mb-2">Professor: {course.professor}</h5>
                    <Button
                      as="a"
                      href={course.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outline-primary"
                      size="sm"
                      className="rounded-pill d-inline-flex align-items-center gap-2"
                    >
                      <FaLinkedin size={16} /> LinkedIn
                    </Button>
                    <p className="mt-3 text-secondary">{course.bio}</p>
                  </div>
                  <div>
                    <h5 className="mb-2">Sobre o curso</h5>
                    <p className="text-secondary mb-0">{course.description}</p>
                  </div>
                </div>
              </Col>
              <Col lg={5} className="mt-4 mt-lg-0">
                <div className="d-flex flex-column align-items-lg-end gap-3">
                  {desktopVideoCard}
                </div>
              </Col>
            </Row>
          ) : (
            <>
              <h5>Professor: {course.professor}</h5>
              <Button
                as="a"
                href={course.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline-primary"
                size="sm"
                className="rounded-pill d-inline-flex align-items-center gap-2"
              >
                <FaLinkedin size={16} /> LinkedIn
              </Button>
              <p className="mt-3">{course.bio}</p>

              <hr />

              <h5>Sobre o curso</h5>
              <p>{course.description}</p>
              {videoSrc && (
                <div className="mt-4">
                  {inlineVideoCard}
                </div>
              )}
            </>
          )}

          {videoModal}

          {course.publicoAlvo && (
            <>
              <hr />
              <h5>🎯 Público-alvo</h5>
              <ul>
                {course.publicoAlvo.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </>
          )}

          {course.oQueVaiAprender && (
            <>
              <hr />
              <h5>✅ O que você vai aprender</h5>
              <ul>
                {course.oQueVaiAprender.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </>
          )}

          {course.modulos && (
            <>
              <hr />
              <h5>📦 Módulos do curso</h5>
              <ol>
                {course.modulos.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ol>
            </>
          )}

          {course.prerequisitos && (
            <>
              <hr />
              <h5>🧠 Pré-requisitos</h5>
              <ul>
                {course.prerequisitos.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </>
          )}

          <Alert variant="warning" className="mt-4">
            💻 <strong>Atenção!</strong> Não disponibilizamos computadores no local
            do curso. É necessário que cada aluno leve seu <strong>notebook pessoal</strong>.<br/>
            Essa abordagem é excelente pois garante que o <strong>ambiente de desenvolvimento</strong> configurado em sala estará prontinho para você continuar praticando em casa!
          </Alert>

          <div className="mt-4 d-flex flex-column flex-md-row gap-3">
            <div>
              {course.ativo ? (
                <>
                  <Link
                    to={`/inscricao/${course.id}`}
                    className="btn btn-success btn-lg fw-bold px-4 py-2"
                  >
                    🚀 Inscreva-se agora
                  </Link>
                  <p className="mt-2 mb-0 text-success-emphasis small">
                    👨‍💻👩‍💻 Poucas vagas restantes! Garanta seu lugar.
                  </p>
                </>
              ) : (
                <Alert variant="danger" className="text-center">
                  🚫 Vagas Encerradas! Fique de olho nas próximas turmas! 
                </Alert>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      <ParcelamentoModal
        show={showParcelamento}
        onHide={() => setShowParcelamento(false)}
        valor={parseFloat(course.price.replace("R$", "").replace(",", "."))}
      />
    </Container>
  )
}

export default CourseDetails
