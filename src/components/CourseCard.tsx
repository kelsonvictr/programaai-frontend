// src/components/CourseCard.tsx
import React from "react"
import { Card, Button } from "react-bootstrap"
import { Link } from "react-router-dom"

interface CourseCardProps {
  id: number
  title: string
  description: string
  duration: string
  price: string
  imageUrl: string
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  description,
  duration,
  price,
  imageUrl,
}) => {
  return (
    <Card className="mb-4 course-card shadow-sm">
      <Card.Img
        variant="top"
        src={imageUrl}
        style={{ height: 150, objectFit: "cover" }}
      />
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text>
          {description.length > 100
            ? description.substring(0, 100) + "..."
            : description}
        </Card.Text>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">{duration}</small>
          <Button as={Link} to={`/cursos/${id}`} variant="primary" size="sm">
            Ver mais
          </Button>
        </div>
      </Card.Body>
      <Card.Footer className="text-muted">Preço: {price}</Card.Footer>
    </Card>
  )
}

export default CourseCard
