import { Link } from 'react-router-dom'
import { Card } from 'react-bootstrap'
import { FaLinkedin } from 'react-icons/fa'

interface CourseCardProps {
  id: number
  title: string
  description: string
  imageUrl: string
  professor: string
  linkedin: string
  datas: string[]
  horario: string
  modalidade: string
}

const CourseCard = ({
  id,
  title,
  description,
  imageUrl,
  professor,
  linkedin,
  datas,
  horario,
  modalidade,
}: CourseCardProps) => {
  return (
    <Card className="mb-4 h-100 shadow-sm">
      <Link to={`/cursos/${id}`}>
        <Card.Img
          variant="top"
          src={imageUrl}
          alt={`Imagem do curso ${title}`}
          style={{ height: '180px', objectFit: 'cover', cursor: 'pointer' }}
        />
      </Link>

      <Card.Body className="d-flex flex-column">
        <small className="text-uppercase text-primary fw-bold mb-2">
          {modalidade}
        </small>

        <Card.Title>{title}</Card.Title>

        <div className="mb-2">
          <strong>Datas:</strong>{' '}
          <span className="text-muted d-inline-flex flex-wrap gap-2">
            {datas.map((data, i) => (
              <span key={i}>{data}</span>
            ))}
          </span>
          <br />
          <strong>Horário:</strong>{' '}
          <span className="text-muted">{horario}</span>
        </div>

        <div className="mb-2">
          <strong>Professor:</strong> {professor}
          <div>
            <a href={linkedin} target="_blank" rel="noopener noreferrer">
              <FaLinkedin size={28} className="mt-1 text-primary" />
            </a>
          </div>
        </div>

        <Card.Text
          className="flex-grow-1 text-muted"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 8,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {description}
        </Card.Text>

        <div className="text-end">
          <Link to={`/cursos/${id}`} className="btn btn-primary btn-sm">
            Ver mais
          </Link>
        </div>
      </Card.Body>
    </Card>
  )
}

export default CourseCard
