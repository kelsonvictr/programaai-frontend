// src/pages/CourseDetails.tsx
import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Container, Card, Button, Alert } from "react-bootstrap"
import { courses } from "../mocks/courses"
import { Link } from 'react-router-dom'

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const course = courses.find(c => c.id === Number(id))

  if (!course) {
    return (
      <Container className="my-5">
        <Alert variant="danger">Curso não encontrado.</Alert>
        <Button onClick={() => navigate("/courses")} variant="secondary">
          Voltar para Cursos
        </Button>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Header as="h3">{course.title}</Card.Header>
        <Card.Body>
          <Card.Text>{course.description}</Card.Text>
          <Card.Text>
            <strong>Duração:</strong> {course.duration}
          </Card.Text>
          <Card.Text>
            <strong>Preço:</strong> {course.price}
          </Card.Text>
          <Button as={Link} to={`/inscricao/${id}`} variant="primary" size="sm">
            Inscreva-se
          </Button>{" "}
          <Button variant="outline-secondary" onClick={() => navigate("/cursos")}>
            Voltar
          </Button>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default CourseDetails
