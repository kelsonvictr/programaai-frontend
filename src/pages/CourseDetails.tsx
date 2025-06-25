import React from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Container, Card, Button, Alert} from "react-bootstrap"
import { FaLinkedin } from "react-icons/fa"
import { courses } from "../mocks/courses"
import ParcelamentoModal from "../components/ParcelamentoModal"
import { useState } from "react"

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const course = courses.find(c => c.id === Number(id))
  const [showParcelamento, setShowParcelamento] = useState(false)


  if (!course) {
    return (
      <Container className="my-5">
        <Alert variant="danger">Curso não encontrado.</Alert>
        <Button onClick={() => navigate("/cursos")} variant="secondary">
          Voltar para Cursos
        </Button>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <Card className="shadow-sm">
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
            <strong>Formas de Pagamento:</strong> Pix ou Cartão de Crédito (em até 12x)<br/>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setShowParcelamento(true)}
            >
              Ver opções de parcelamento
            </Button>

          </p>

          <hr />

          <h5>Professor: {course.professor}</h5>
          <div className="mb-3">
            <a href={course.linkedin} target="_blank" rel="noopener noreferrer">
              <FaLinkedin size={28} />
            </a>
          </div>
          <p>{course.bio}</p>

          <hr />

          <h5>Sobre o curso</h5>
          <p>{course.description}</p>

          {course.prerequisitos && course.prerequisitos.length > 0 && (
          <>
            <hr />
            <h5>Pré-requisitos</h5>
            <ul>
              {course.prerequisitos.map((item, idx) => (
                <li key={idx} style={{ marginBottom: "0.5rem" }}>{item}</li>
              ))}
            </ul>
          </>
        )}

          <div className="alert alert-warning d-flex align-items-start gap-2" role="alert">
            <span style={{ fontSize: "1.5rem" }}>💻</span>
            <div>
              <strong>Atenção!</strong> Não disponibilizamos computadores no local do curso. É necessário que cada aluno leve seu <strong>notebook pessoal</strong>.  
              <br />
              Essa abordagem é excelente pois garante que o <strong>ambiente de desenvolvimento</strong> configurado em sala estará prontinho para você continuar praticando em casa!
            </div>
          </div>

          <div className="mt-4 d-flex flex-column flex-md-row gap-3">
            <div>
              <Link to={`/inscricao/${id}`} className="btn btn-success btn-lg fw-bold px-4 py-2">
                🚀 Inscreva-se agora
              </Link>
              <p className="mt-2 mb-0 text-success-emphasis small">
                👨‍💻👩‍💻 Poucas vagas restantes! Garanta seu lugar.
              </p>
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
