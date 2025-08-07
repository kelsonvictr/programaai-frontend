// src/pages/CourseDetails.tsx
import React, { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Container, Card, Button, Alert, Spinner } from "react-bootstrap"
import axios from "axios"
import { FaLinkedin, FaWhatsapp } from "react-icons/fa"
import ParcelamentoModal from "../components/ParcelamentoModal"

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
      .get<Course>(`${import.meta.env.VITE_API_URL}/cursos`, { params: { id } })
      .then(resp => setCourse(resp.data))
      .catch(err => {
        console.error("Erro ao carregar curso:", err)
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

  if (error || !course) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || "Curso não encontrado."}</Alert>
        <Button variant="secondary" onClick={() => navigate("/cursos")}>
          Voltar para Cursos
        </Button>
      </Container>
    )
  }

  const valor = parseFloat(course.price.replace("R$", "").replace(",", "."))
  const valorCartao = +(valor * 1.08).toFixed(2)
  const parcela12 = +(valorCartao / 12).toFixed(2)

  return (
    <Container className="py-5">
      <Card className="shadow-sm position-relative">
        {/* Banner com overlay caso vagas encerradas */}
        <div className="position-relative">
          <Card.Img
            variant="top"
            src={course.bannerSite}
            alt={`Banner do curso ${course.title}`}
            style={{ maxHeight: "400px", objectFit: "cover" }}
          />
          {!course.ativo && (
            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
              style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            >
              <h1 className="text-white">Vagas Encerradas</h1>
            </div>
          )}
        </div>

        <Card.Body>
          <Card.Title as="h2">{course.title}</Card.Title>
          <p className="text-muted">
            <strong>Modalidade:</strong> {course.modalidade} <br />
            <strong>Datas:</strong> {course.datas.join(" | ")} <br />
            <strong>Horário:</strong> {course.horario} <br />
            <strong>Duração:</strong> {course.duration} <br />
            <strong>Investimento PIX:</strong> R$ {valor.toFixed(2)} <br />
            <strong>Investimento Cartão:</strong> R$ {valorCartao.toFixed(2)}{" "}
            <small className="text-muted">
              (até 12× de R$ {parcela12.toFixed(2)})
            </small>
            {course.obsPrice && <span> ({course.obsPrice})</span>}<br />
          </p>

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

          <hr />

          <h5>Professor: {course.professor}</h5>
          <div className="mb-3">
            <a href={course.linkedin} target="_blank" rel="noopener noreferrer">
              <FaLinkedin size={28} className="text-primary" />
            </a>
          </div>
          <p>{course.bio}</p>

          <hr />

          <h5>Sobre o curso</h5>
          <p>{course.description}</p>

          {course.publicoAlvo && (
            <>
              <hr />
              <h5>🎯 Público-alvo</h5>
              <ul>
                {course.publicoAlvo.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </>
          )}

          {course.oQueVaiAprender && (
            <>
              <hr />
              <h5>✅ O que você vai aprender</h5>
              <ul>
                {course.oQueVaiAprender.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </>
          )}

          {course.modulos && (
            <>
              <hr />
              <h5>📦 Módulos do curso</h5>
              <ol>
                {course.modulos.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            </>
          )}

          {course.prerequisitos && (
            <>
              <hr />
              <h5>🧠 Pré-requisitos</h5>
              <ul>
                {course.prerequisitos.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </>
          )}

          <div className="alert alert-warning d-flex align-items-start gap-3" role="alert">
            <span style={{ fontSize: "1.5rem" }}>💻</span>
            <div>
              <strong>Atenção!</strong> Cada aluno deve levar seu próprio{" "}
              <strong>notebook</strong> para configurar o ambiente e continuar praticando em casa.
            </div>
          </div>

          {/* Botão de inscrição ou mensagem de encerrado */}
          {course.ativo ? (
            <div className="mt-4">
              <Link
                to={`/inscricao/${course.id}`}
                className="btn btn-success btn-lg fw-bold px-4 py-2"
              >
                🚀 Inscreva-se agora
              </Link>
              <p className="mt-2 text-success small">
                👨‍💻👩‍💻 Poucas vagas restantes! Garanta seu lugar.
              </p>
            </div>
          ) : (
            <div className="mt-4 text-center">
              <h4 className="text-danger">Vagas Encerradas 🎫</h4>
              <p className="text-muted">Fique de olho nas próximas turmas!</p>
            </div>
          )}
        </Card.Body>
      </Card>

      <ParcelamentoModal
        show={showParcelamento}
        onHide={() => setShowParcelamento(false)}
        valor={valor}
      />
    </Container>
  )
}

export default CourseDetails
