// src/pages/CourseDetails.tsx
import React, { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  Container,
  Card,
  Button,
  Alert,
  Spinner,
  Ratio,
  Modal,
  Accordion,
  Row,
  Col
} from "react-bootstrap"
import axios from "axios"
import {
  FaLinkedin,
  FaWhatsapp,
  FaPlay,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaCheckCircle
} from "react-icons/fa"
import ParcelamentoModal from "../components/ParcelamentoModal"
import { calcularValores } from "../utils/payment"
import Seo from "../components/Seo"
import { buildAbsoluteUrl, SITE_URL } from "../config/seo"
import Typewriter from "../components/Typewriter"
import CourseGallery from "../components/CourseGallery"
import "../styles/course-details-landing.css"

const COURSE_TYPEWRITER_PHRASES = [
  "Presencial ao vivo em João Pessoa",
  "Suporte direto de Professores e Monitores",
  "Mentoria durante e após o curso",
  "Networking com a comunidade local",
  "Práticas reais de mercado",
  "Professores atuantes na indústria",
  "Desafios reais usando as stacks do mercado",
  "Soft skills trabalhadas junto com o código",
  "Comunidade ativa e eventos presenciais",
  "Aulas gravadas para rever depois",
  "Turmas reduzidas para aprender com foco",
]

const WHATSAPP_MESSAGE =
  "Oi prof. Kelson, venho do site da programa AI, poderia me esclarecer algumas dúvidas?"
const WHATSAPP_LINK = `https://wa.me/5583986608771?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
const LOCATION_IMAGE = "/galeria-course-details/14.jpg"

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
  faq?: { pergunta: string; resposta: string }[]
  ativo: boolean
}

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showParcelamento, setShowParcelamento] = useState(false)
  const [showAllDates, setShowAllDates] = useState(false)
  const [profPhotoError, setProfPhotoError] = useState(false)
  const [heroIndex, setHeroIndex] = useState(0)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  const canonicalPath = course ? `/cursos/${course.id}` : undefined
  const enrollmentPath = course ? `/inscricao/${course.id}` : undefined

  const structuredData = useMemo(() => {
    if (!course || !canonicalPath || !enrollmentPath) {
      return undefined
    }

    const priceNumeric = Number(
      course.price
        .replace(/[^0-9,\.]/g, "")
        .replace(/\./g, "")
        .replace(/,/, ".")
    )

    const firstDate = course.datas?.[0]
    const isoDate = firstDate
      ? (() => {
          const [day, month, year] = firstDate.split("/")
          if (!day || !month || !year) return undefined
          return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
        })()
      : undefined

    const courseSchema = {
      "@context": "https://schema.org",
      "@type": "Course",
      name: course.title,
      description: course.description,
      provider: {
        "@type": "EducationalOrganization",
        name: "Programa AI",
        sameAs: SITE_URL,
      },
      inLanguage: "pt-BR",
      courseMode: course.modalidade,
      timeRequired: course.duration,
      offers: {
        "@type": "Offer",
        priceCurrency: "BRL",
        price: Number.isFinite(priceNumeric) ? priceNumeric.toFixed(2) : undefined,
        availability: course.ativo ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
        url: buildAbsoluteUrl(enrollmentPath),
      },
      ...(isoDate
        ? {
            hasCourseInstance: {
              "@type": "CourseInstance",
              name: `${course.title} - Turma ${course.datas[0]}`,
              startDate: isoDate,
              location: {
                "@type": "Place",
                name: "Programa AI",
                address: "Av. Pres. Epitácio Pessoa, João Pessoa - PB",
              },
            },
          }
        : {}),
    }

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Início",
          item: buildAbsoluteUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Cursos",
          item: buildAbsoluteUrl("/cursos"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: course.title,
          item: buildAbsoluteUrl(canonicalPath),
        },
      ],
    }

    return [breadcrumb, courseSchema]
  }, [course, canonicalPath, enrollmentPath])

  const heroImages = useMemo(() => {
    const modules = import.meta.glob("/public/hero-photos/*.{png,jpg,jpeg,webp,avif}", {
      eager: true,
      as: "url",
    }) as Record<string, string>
    return Object.values(modules)
  }, [])

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
    if (heroImages.length <= 1) return
    const interval = window.setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroImages.length)
    }, 4000)
    return () => window.clearInterval(interval)
  }, [heroImages.length])

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
  const videoCaption = "Assista ao nosso vídeo de apresentação do curso."
  const showCombinedLayout = Boolean(videoSrc && isDesktop)
  const handleOpenVideo = () => setShowVideoModal(true)
  const professorInitials = course.professor
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("")
  const datesCountLabel =
    course.datas && course.datas.length > 0
      ? `${course.datas.length} encontros`
      : "Datas a confirmar"
  const nextDateLabel = course.datas?.[0] ? `Próxima turma: ${course.datas[0]}` : "Próxima turma em breve"
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
        <Ratio aspectRatio="16x9">
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
        <Ratio aspectRatio="16x9">
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

  const safeDates = Array.isArray(course.datas) ? course.datas : []
  const datesToShow = showAllDates ? safeDates : safeDates.slice(0, 3)
  const remainingDates = Math.max(safeDates.length - 3, 0)

  return (
    <>
      <Seo
        title={`${course.title} | Curso presencial em João Pessoa | Programa AI`}
        description={course.description}
        canonical={canonicalPath}
        image={buildAbsoluteUrl(course.bannerSite || course.imageUrl)}
        ogType="article"
        structuredData={structuredData}
      />
      <Container className="course-landing py-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <Link to="/cursos" className="course-back-link px-0 d-inline-flex align-items-center gap-2">
            <FaArrowLeft /> Ver todos os cursos
          </Link>
          {!isDesktop && !course.ativo && (
            <span className="course-status-pill">Vagas encerradas</span>
          )}
        </div>

        <section className="course-hero-card">
          {!course.ativo && (
            <div className="course-hero-ribbon">VAGAS ENCERRADAS</div>
          )}
          <div className="course-hero-media" />
          {heroImages.length > 0 && (
            <div className="course-hero-slides" aria-hidden="true">
              {heroImages.map((src, idx) => (
                <div
                  key={src}
                  className={`course-hero-slide${idx === heroIndex ? " is-active" : ""}`}
                  style={{ backgroundImage: `url(${src})` }}
                />
              ))}
            </div>
          )}
          <div className="course-hero-overlay" />
          <div className="course-hero-content">
            <div className="course-hero-text">
              <div className="course-hero-textPanel">
                <span className="course-hero-kicker">Curso presencial em João Pessoa</span>
                <h1 className="course-hero-title">{course.title}</h1>
                <div className="course-typewriter-banner">
                  <span className="course-typewriter-title">Experiência Imersiva e Presencial</span>
                  <Typewriter phrases={COURSE_TYPEWRITER_PHRASES} className="course-typewriter-text" />
                </div>
                <p className="course-hero-description">{course.description}</p>
                <div className="course-hero-chips">
                  <span className="course-chip">{course.modalidade}</span>
                  <span className="course-chip">{datesCountLabel}</span>
                  <span className="course-chip">{course.horario}</span>
                  <span className="course-chip">João Pessoa - PB</span>
                </div>
              </div>
            </div>

            <div className="course-hero-actions">
              <div className="course-price-box">
                <div className="course-price-header">
                  <span className="course-price-label">Investimento</span>
                  <span className="course-price-value">{course.price} <span className="course-price-subnote">(Valor total do curso)</span></span>
                </div>
                {course.ativo && (
                  <span className="text-warning small fw-semibold">
                    ⏳ Vagas limitadas para esta turma
                  </span>
                )}
                {course.obsPrice && (
                  <div className="course-price-note">{course.obsPrice}</div>
                )}
              {(() => {
                const { base, parcela12 } = calcularValores(course.price)
                return (
                  <div className="course-price-breakdown">
                    <span>Pix à vista: R$ {base.toFixed(2).replace(".", ",")}</span>
                    <span>12x de R$ {parcela12.toFixed(2).replace(".", ",")}</span>
                  </div>
                )
              })()}
              <div className="course-price-info">{nextDateLabel}</div>
              <button
                type="button"
                className="course-link course-link--onDark"
                onClick={() => setShowParcelamento(true)}
                aria-label="Ver parcelamento e condições"
              >
                Ver parcelamento e condições
              </button>
            </div>

              <div className="course-hero-cta">
                <Button
                  as="a"
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="success"
                  className="course-btn-primary"
                >
                  <FaWhatsapp /> Falar no Whatsapp
                </Button>
                {course.ativo ? (
                  <Link to={`/inscricao/${course.id}`} className="btn btn-outline-primary course-btn-secondary">
                    Garantir minha vaga
                  </Link>
                ) : (
                  <Alert variant="danger" className="course-closed-alert">
                    🚫 Vagas encerradas! Avise-me da próxima turma.
                  </Alert>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="course-section-card course-section-grid">
          <div>
            <h2 className="course-section-title">Detalhes da turma</h2>
            <p className="course-section-subtitle">
              Planeje seu ritmo de estudos e garanta sua presença nas aulas presenciais.
            </p>
          </div>
          <div className="course-info-grid">
            <div className="course-info-item">
              <span className="course-info-label">Datas</span>
              <span className="course-info-value">
                {datesToShow.join(" | ")}
                {!showAllDates && remainingDates > 0 ? ` | +${remainingDates} datas` : ""}
              </span>
              {remainingDates > 0 && (
                <button
                  type="button"
                  className="course-link"
                  onClick={() => setShowAllDates(prev => !prev)}
                  aria-label={showAllDates ? "Ver menos datas" : "Ver todas as datas"}
                >
                  {showAllDates ? "Ver menos" : "Ver todas"}
                </button>
              )}
            </div>
            <div className="course-info-item">
              <span className="course-info-label">Horário</span>
              <span className="course-info-value">{course.horario}</span>
            </div>
            <div className="course-info-item">
              <span className="course-info-label">Duração</span>
              <span className="course-info-value">{course.duration}</span>
            </div>
            <div className="course-info-item">
              <span className="course-info-label">Modalidade</span>
              <span className="course-info-value">{course.modalidade}</span>
            </div>
          </div>
        </section>

        {videoSrc && (
          <section className="course-section-card">
            <div className="course-section-header">
              <h2 className="course-section-title">Veja a experiência do curso</h2>
              <p className="course-section-subtitle">{videoCaption}</p>
            </div>
            {showCombinedLayout ? (
              <div className="course-video-desktop">{desktopVideoCard}</div>
            ) : (
              <div className="course-video-mobile">{inlineVideoCard}</div>
            )}
          </section>
        )}

        {course.oQueVaiAprender && (
          <section className="course-section-card">
            <h2 className="course-section-title">O que você vai aprender</h2>
            <ul className="course-icon-list">
              {course.oQueVaiAprender.map((item, idx) => (
                <li key={idx}>
                  <FaCheckCircle className="text-success" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {course.modulos && (
          <section className="course-section-card">
            <h2 className="course-section-title">Módulos do curso</h2>
            <Accordion 
              className="course-accordion" 
              flush 
              defaultActiveKey={course.modulos.map((_, idx) => `${idx}`)}
              alwaysOpen
            >
              {course.modulos.map((item, idx) => (
                <Accordion.Item eventKey={`${idx}`} key={`${item}-${idx}`}>
                  <Accordion.Header>Módulo {idx + 1}</Accordion.Header>
                  <Accordion.Body>{item}</Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </section>
        )}

        <section className="course-section-card course-instructor">
          <div className="course-instructor-avatar">
            {course.profFoto && !profPhotoError ? (
              <img
                src={course.profFoto}
                alt={`Foto de ${course.professor}`}
                onError={() => setProfPhotoError(true)}
              />
            ) : (
              <span>{professorInitials}</span>
            )}
          </div>
          <div className="course-instructor-content">
            <h2 className="course-section-title">Professor {course.professor}</h2>
            <p className="course-section-subtitle">{course.bio}</p>
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
          </div>
        </section>

        {(course.publicoAlvo || course.prerequisitos) && (
          <section className="course-section-card course-dual-grid">
            {course.publicoAlvo && (
              <div>
                <h2 className="course-section-title">Público-alvo</h2>
                <ul className="course-bullet-list">
                  {course.publicoAlvo.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {course.prerequisitos && (
              <div>
                <h2 className="course-section-title">Pré-requisitos</h2>
                <ul className="course-bullet-list">
                  {course.prerequisitos.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        <section className="course-section-card">
          <h2 className="course-section-title">Como é a experiência presencial</h2>
          <p className="course-section-subtitle">
            Turmas reduzidas, espaço confortável e prática guiada em cada encontro.
          </p>
          <CourseGallery />
        </section>

        <section className="course-section-card course-location-card mt-0">
          <Row className="g-3 align-items-center">
            <Col md={5}>
              <img
                src={LOCATION_IMAGE}
                alt="Espaço físico da Programa AI"
                className="course-location-image"
                loading="lazy"
              />
            </Col>
            <Col md={7}>
              <h6 className="text-primary fw-bold mb-2">Onde acontecem as aulas</h6>
              <p className="mb-3">
                Empresarial Eldorado — Av. Epitácio Pessoa, 1133, Sala 104. Ambiente climatizado,
                cadeiras ergonômicas NR17, projetor multimídia e café à vontade para manter o ritmo
                nas práticas presenciais.
              </p>
              <ul className="course-location-list">
                <li>
                  <FaMapMarkerAlt className="text-danger me-2" /> Localização central, fácil acesso e estacionamento próximo
                </li>
                <li>
                  <FaCheckCircle className="text-success me-2" /> Mesão colaborativo para pair programming e mentorias individuais
                </li>
                <li>
                  <FaCheckCircle className="text-success me-2" /> Coffee station liberado durante as aulas
                </li>
              </ul>
              <div className="d-flex flex-wrap gap-2">
                <Button
                  as="a"
                  href="https://www.google.com/maps/place/Empresarial+Eldorado/@-7.119502,-34.8602648,17z"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline-primary"
                  className="d-inline-flex align-items-center gap-2"
                >
                  <FaMapMarkerAlt /> Ver rota no Google Maps
                </Button>
                <Button
                  as="a"
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="success"
                  className="d-inline-flex align-items-center gap-2"
                >
                  <FaWhatsapp /> Falar no Whatsapp
                </Button>
              </div>
            </Col>
          </Row>
        </section>

        {course.faq && course.faq.length > 0 && (
          <section className="course-section-card">
            <h2 className="course-section-title">Perguntas frequentes</h2>
            <Accordion className="course-accordion" flush>
              {course.faq.map((item, idx) => (
                <Accordion.Item eventKey={`${idx}`} key={`${item.pergunta}-${idx}`}>
                  <Accordion.Header>{item.pergunta}</Accordion.Header>
                  <Accordion.Body>{item.resposta}</Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </section>
        )}

        <Alert variant="warning" className="course-section-card course-alert">
          💻 <strong>Atenção!</strong> Não disponibilizamos computadores no local do curso. É necessário que cada aluno leve
          seu <strong>notebook pessoal</strong>. Essa abordagem é excelente pois garante que o{" "}
          <strong>ambiente de desenvolvimento</strong> configurado em sala estará prontinho para você continuar praticando em casa!
        </Alert>

        <section className="course-section-card course-final-cta">
          <div>
            <h2 className="course-section-title">Pronto para garantir sua vaga?</h2>
            <p className="course-section-subtitle">
              Converse com a equipe e finalize sua inscrição em poucos minutos.
            </p>
          </div>
          <div className="course-final-actions">
            {course.ativo ? (
              <Link to={`/inscricao/${course.id}`} className="btn btn-primary course-btn-primary">
                Garantir minha vaga
              </Link>
            ) : (
              <Alert variant="danger" className="course-closed-alert">
                🚫 Vagas encerradas! Avise-me da próxima turma.
              </Alert>
            )}
            <Button
              as="a"
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              variant="success"
              className="course-btn-secondary"
            >
              <FaWhatsapp /> Tirar dúvidas no WhatsApp
            </Button>
          </div>
        </section>

        {videoModal}

        <ParcelamentoModal
          show={showParcelamento}
          onHide={() => setShowParcelamento(false)}
          valor={parseFloat(course.price.replace("R$", "").replace(",", "."))}
        />
      </Container>

      {!isDesktop && (
        <div className="course-sticky-cta">
          <Button
            as="a"
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            variant="success"
            className="course-sticky-primary"
          >
            <FaWhatsapp /> WhatsApp
          </Button>
          {course.ativo && (
            <Link to={`/inscricao/${course.id}`} className="btn btn-outline-primary course-sticky-secondary">
              Inscrição
            </Link>
          )}
        </div>
      )}
    </>
  )
}

export default CourseDetails
