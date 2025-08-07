// src/components/CourseCard.tsx
import { Link } from "react-router-dom"
import { Card, Button } from "react-bootstrap"
import { FaLinkedin } from "react-icons/fa"

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
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  description,
  price,
  imageUrl,
  professor,
  linkedin,
  datas,
  horario,
  modalidade,
}) => {
  return (
    <Card className="mb-4 h-100 shadow-sm">
      <Link to={`/inscricao/${id}`}>
        <Card.Img
          variant="top"
          src={imageUrl}
          alt={`Banner do curso ${title}`}
          style={{ height: 180, objectFit: "cover", cursor: "pointer" }}
        />
      </Link>

      <Card.Body className="d-flex flex-column">
        <small className="text-uppercase text-primary fw-bold mb-2">
          {modalidade}
        </small>

        <Card.Title>{title}</Card.Title>

        {/* preço */}
        <h5 className="text-success mb-3">{price}</h5>

        <div className="mb-2">
          <strong>Datas:</strong>{" "}
          <span className="text-muted d-inline-flex flex-wrap gap-2">
            {datas.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </span>
          <br />
          <strong>Horário:</strong> <span className="text-muted">{horario}</span>
        </div>

        <div className="mb-2">
          <strong>Professor(a):</strong> {professor}{" "}
          <a href={linkedin} target="_blank" rel="noopener noreferrer">
            <FaLinkedin size={20} className="ms-2 text-primary" />
          </a>
        </div>

        <Card.Text
          className="flex-grow-1 text-muted"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </Card.Text>

        <div className="text-end mt-3">
          <Link to={`/inscricao/${id}`}>
            <Button variant="primary" size="sm">
              Inscrever-se
            </Button>
          </Link>
        </div>
      </Card.Body>
    </Card>
  )
}

export default CourseCard
