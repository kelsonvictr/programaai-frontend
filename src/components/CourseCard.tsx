// src/components/CourseCard.tsx
import { Link } from "react-router-dom"
import { Card, Button } from "react-bootstrap"
import { FaLinkedin, FaArrowRight } from "react-icons/fa"
import DynamicCourseCard from "./DynamicCourseCard"
import "./CourseCard.css"

interface CourseCardProps {
  id: string             
  title: string
  description: string
  price: string               
  imageUrl: string
  professor: string
  linkedin: string
  datas: string[]
  horario: string
  modalidade: string
  profFoto?: string
  // Novos campos opcionais para cards dinâmicos
  technologiaIcone?: string
  bgGradient?: string
  descricaoCurta?: string
}

const CourseCard: React.FC<CourseCardProps> = (props) => {
  const {
    id,
    title,
    description,
    imageUrl,
    professor,
    linkedin,
    datas,
    horario,
    modalidade,
    profFoto,
    technologiaIcone,
    bgGradient,
    descricaoCurta,
  } = props

  // Se tem technologiaIcone ou bgGradient, usa o card dinâmico
  const useDynamicCard = !!(technologiaIcone || bgGradient)

  if (useDynamicCard) {
    return (
      <DynamicCourseCard
        id={id}
        title={title}
        description={description}
        descricaoCurta={descricaoCurta}
        professor={professor}
        profFoto={profFoto || "/professores/default.jpg"}
        datas={datas}
        horario={horario}
        modalidade={modalidade}
        technologiaIcone={technologiaIcone}
        bgGradient={bgGradient}
      />
    )
  }

  // Card estático original (para cursos antigos)
  return (
    <Card className="course-card-dark h-100">
      <Link to={`/cursos/${id}`}>
        <Card.Img
          variant="top"
          src={imageUrl}
          alt={`Banner do curso ${title}`}
          className="course-card-img"
        />
      </Link>

      <Card.Body className="d-flex flex-column">
        <span className="course-card-badge">
          {modalidade}
        </span>

        <Card.Title className="course-card-title">{title}</Card.Title>

        <div className="course-card-meta">
          <div className="meta-row">
            <strong>Datas:</strong>{" "}
            <span>
              {datas.slice(0, 2).map((d, i) => (
                <span key={i}>{d}{i < Math.min(datas.length, 2) - 1 ? ", " : ""}</span>
              ))}
              {datas.length > 2 && <span>...</span>}
            </span>
          </div>
          <div className="meta-row">
            <strong>Horário:</strong> <span>{horario}</span>
          </div>
        </div>

        <div className="course-card-prof">
          <strong>Professor(a):</strong> {professor}{" "}
          <a href={linkedin} target="_blank" rel="noopener noreferrer" className="linkedin-icon">
            <FaLinkedin size={18} />
          </a>
        </div>

        <Card.Text className="course-card-desc flex-grow-1">
          {description}
        </Card.Text>

        <div className="text-end mt-3">
          <Link to={`/cursos/${id}`}>
            <Button className="course-card-btn">
              Ver Detalhes <FaArrowRight />
            </Button>
          </Link>
        </div>
      </Card.Body>
    </Card>
  )
}

export default CourseCard
