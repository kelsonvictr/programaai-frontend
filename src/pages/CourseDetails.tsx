// src/pages/CourseDetails.tsx
import React, { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  Container,
  Card,
  Button,
  Alert,
  Spinner,
  Ratio
} from "react-bootstrap"
import axios from "axios"
import { FaLinkedin, FaWhatsapp } from "react-icons/fa"
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

          {course.video && (
            <div className="mt-4">
              <h5 className="mb-3 text-primary fw-bold">
                🎬 Conheça o curso em vídeo
              </h5>
              <Card
                className="border-0 shadow-sm overflow-hidden bg-dark text-white"
                style={{ maxWidth: "460px", marginLeft: "auto", marginRight: "auto" }}
              >
                <Card.Body className="p-0">
                  <Ratio aspectRatio={16 / 9}>
                    <video
                      src={`/videos-cursos/${course.video}`}
                      controls
                      preload="metadata"
                      poster={course.bannerSite}
                      className="w-100 h-100"
                      style={{ objectFit: "contain", backgroundColor: "#000" }}
                      playsInline
                    >
                      Seu navegador não suporta a reprodução de vídeo.
                    </video>
                  </Ratio>
                </Card.Body>
                <Card.Footer className="bg-dark text-white-50">
                  Veja os highlights do curso em formato vertical, perfeito para sentir a imersão das aulas.
                </Card.Footer>
              </Card>
            </div>
          )}

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

          <h5>Professor: {course.professor}</h5>
          <a
            href={course.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="me-2"
          >
            <FaLinkedin size={28} />
          </a>
          <p>{course.bio}</p>

          <hr />

          <h5>Sobre o curso</h5>
          <p>{course.description}</p>

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
