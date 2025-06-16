import { Link } from 'react-router-dom'

interface CourseCardProps {
  id: number
  title: string
  description: string
}

const CourseCard = ({ id, title, description }: CourseCardProps) => {
  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{description}</p>
        <Link to={`/curso/${id}`} className="btn btn-primary">
          Ver mais
        </Link>
      </div>
    </div>
  )
}

export default CourseCard
