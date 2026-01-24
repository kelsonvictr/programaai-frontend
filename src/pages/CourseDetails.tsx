// src/pages/CourseDetails.tsx
import React, { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  Container,
  Button,
  Alert,
  Spinner,
  Accordion,
  Row,
  Col
} from "react-bootstrap"
import axios from "axios"
import {
  FaLinkedin,
  FaWhatsapp,
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
import LocationCarousel from "../components/LocationCarousel"
import ModernVideoPlayer from "../components/ModernVideoPlayer"
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
  // Novos campos para cards dinâmicos
  technologiaIcone?: string
  bgGradient?: string
  descricaoCurta?: string
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

  const safeDates = Array.isArray(course.datas) ? course.datas : []
  const datesToShow = showAllDates ? safeDates : safeDates.slice(0, 6)
  const remainingDates = Math.max(safeDates.length - 6, 0)

  // Função para formatar datas
  const formatDateInfo = (dateStr: string) => {
    const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"]
    const weekdays = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"]
    
    // Tenta parsear a data no formato DD/MM/YYYY
    const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/)
    if (match) {
      const [, day, month, year] = match
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      const monthName = months[parseInt(month) - 1]
      
      // Extrai o dia da semana do formato original se tiver
      const weekdayMatch = dateStr.match(/\((.*?)\)/)
      const displayWeekday = weekdayMatch ? weekdayMatch[1] : weekdays[dateObj.getDay()]
      
      return {
        day: day,
        month: monthName,
        weekday: displayWeekday,
        fullDate: dateStr
      }
    }
    
    // Fallback se não conseguir parsear
    return {
      day: "--",
      month: "---",
      weekday: "",
      fullDate: dateStr
    }
  }

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

        <section className="course-section-card course-details-section">
          <div className="course-details-header">
            <h2 className="course-section-title">Detalhes da turma</h2>
            <p className="course-section-subtitle">
              Planeje seu ritmo de estudos e garanta sua presença nas aulas presenciais.
            </p>
          </div>
          
          <div className="course-details-grid">
            <div className="course-info-item course-info-dates-section">
              <span className="course-info-label">📅 DATAS DAS AULAS</span>
              <div className="course-dates-grid">
                {datesToShow.map((dateStr, idx) => {
                  const dateInfo = formatDateInfo(dateStr)
                  return (
                    <div key={idx} className="course-date-card">
                      <div className="course-date-card-header">
                        <span className="course-date-month">{dateInfo.month}</span>
                      </div>
                      <div className="course-date-card-body">
                        <span className="course-date-day">{dateInfo.day}</span>
                        <span className="course-date-weekday">{dateInfo.weekday}</span>
                      </div>
                    </div>
                  )
                })}
                {remainingDates > 0 && !showAllDates && (
                  <div 
                    className="course-date-card course-date-card-more"
                    onClick={() => setShowAllDates(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setShowAllDates(true)}
                    title="Clique para ver todas as datas"
                  >
                    <div className="course-date-card-body">
                      <span className="course-date-more-count">+{remainingDates}</span>
                      <span className="course-date-more-label">clique para ver</span>
                    </div>
                  </div>
                )}
              </div>
              {remainingDates > 0 && (
                <button
                  type="button"
                  className="course-dates-toggle-btn"
                  onClick={() => setShowAllDates(prev => !prev)}
                  aria-label={showAllDates ? "Ver menos datas" : "Ver todas as datas"}
                >
                  {showAllDates ? "← Ver menos datas" : "Ver todas as datas →"}
                </button>
              )}
            </div>
            
            <div className="course-info-sidebar">
              <div className="course-info-item course-info-highlight">
                <span className="course-info-label">🕐 HORÁRIO</span>
                <span className="course-info-value-large">{course.horario}</span>
                <span className="course-info-hint">Horário de João Pessoa/PB</span>
              </div>
              <div className="course-info-item course-info-highlight">
                <span className="course-info-label">⏱️ DURAÇÃO</span>
                <span className="course-info-value-large">{course.duration}</span>
                <span className="course-info-hint">Incluindo intervalos</span>
              </div>
              <div className="course-info-item course-info-highlight course-info-presencial">
                <span className="course-info-label">📍 MODALIDADE</span>
                <span className="course-info-value-large">{course.modalidade}</span>
                <span className="course-info-hint">Na Av. Epitácio Pessoa, João Pessoa/PB</span>
              </div>
            </div>
          </div>
        </section>

        {videoSrc && (
          <section className="course-section-card course-video-section">
            <div className="course-section-header-center">
              <h2 className="course-section-title">Veja a experiência do curso</h2>
              <p className="course-section-subtitle">
                Conheça como são as aulas, o ambiente e a metodologia presencial que vai acelerar seu aprendizado
              </p>
            </div>
            <ModernVideoPlayer 
              videoSrc={videoSrc}
              posterSrc={videoPoster}
              title="Apresentação do Curso"
            />
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
              {course.modulos.map((item, idx) => {
                const moduleIcons = ['📚', '💻', '🔧', '🎯', '⚡', '🚀', '🔥', '✨']
                const icon = moduleIcons[idx % moduleIcons.length]
                return (
                  <Accordion.Item eventKey={`${idx}`} key={`${item}-${idx}`}>
                    <Accordion.Header>
                      <span className="module-icon">{icon}</span>
                      Módulo {idx + 1}
                    </Accordion.Header>
                    <Accordion.Body>{item}</Accordion.Body>
                  </Accordion.Item>
                )
              })}
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

        <section className="course-benefit-banner course-benefit-banner-1">
          <div className="benefit-banner-content">
            <div className="benefit-banner-icon">🤝</div>
            <h3 className="benefit-banner-title">Aprendizado Colaborativo</h3>
            <p className="benefit-banner-text">
              Presencial não é só estar no mesmo lugar. É trocar ideias, debater soluções e 
              aprender com quem está no mesmo caminho que você.
            </p>
          </div>
        </section>

        <section className="course-section-card">
          <h2 className="course-section-title">Como é a experiência presencial</h2>
          <p className="course-section-subtitle">
            Turmas reduzidas, espaço confortável e prática guiada em cada encontro.
          </p>
          <CourseGallery />
        </section>

        <section className="course-benefit-banner course-benefit-banner-2">
          <div className="benefit-banner-content">
            <div className="benefit-banner-icon">💡</div>
            <h3 className="benefit-banner-title">Feedback em Tempo Real</h3>
            <p className="benefit-banner-text">
              Dúvidas surgem? Professores e monitores ao seu lado para responder na hora. 
              Sem esperar, sem ficar travado. Evolua mais rápido.
            </p>
          </div>
        </section>

        <section className="course-benefit-banner course-benefit-banner-3">
          <div className="benefit-banner-content">
            <div className="benefit-banner-icon">🎯</div>
            <h3 className="benefit-banner-title">Networking que Transforma</h3>
            <p className="benefit-banner-text">
              Seus colegas de turma são sua primeira rede profissional. Projetos em grupo, 
              networking e conexões que vão além da sala de aula.
            </p>
          </div>
        </section>

        <section className="course-section-card course-location-card mt-0">
          <Row className="g-4 align-items-center">
            <Col md={5}>
              <LocationCarousel />
            </Col>
            <Col md={7}>
              <div className="location-header mb-3">
                <span className="location-badge">📍 Localização</span>
                <h3 className="location-title">Av. Epitácio Pessoa, 1133 - João Pessoa/PB</h3>
                <p className="location-subtitle">Empresarial Eldorado, Sala 104</p>
              </div>
              <p className="location-description">
                Ambiente climatizado, cadeiras ergonômicas NR17, projetor multimídia e café à vontade 
                para manter o ritmo nas práticas presenciais. Um espaço projetado para você aprender 
                com foco e conforto.
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

        <section className="course-benefit-banner course-benefit-banner-4">
          <div className="benefit-banner-content">
            <div className="benefit-banner-icon">🚀</div>
            <h3 className="benefit-banner-title">Foco e Disciplina que Funcionam</h3>
            <p className="benefit-banner-text">
              Estudar em casa tem suas distrações. No presencial, você entra no modo foco: 
              ambiente preparado, colegas motivados e aprendizado intenso.
            </p>
          </div>
        </section>

        {course.faq && course.faq.length > 0 && (
          <section className="course-section-card">
            <h2 className="course-section-title">Perguntas frequentes</h2>
            <Accordion 
              className="course-accordion" 
              flush
              defaultActiveKey={course.faq.map((_, idx) => `${idx}`)}
              alwaysOpen
            >
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
