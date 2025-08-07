// src/pages/Courses.tsx
import React, { useState, useEffect } from "react"
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap"
import CourseCard from "../components/CourseCard"
import axios from "axios"
import { FaWhatsapp } from "react-icons/fa"

// Interface para tipar seus cursos (pode ajustar campos conforme o seu backend)
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
  prerequisitos?: string[]
  publicoAlvo?: string[]
  oQueVaiAprender?: string[]
  modulos?: string[]
}

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    axios
      .get<Course[]>(`${import.meta.env.VITE_API_URL}/cursos`)
      .then(resp => {
        setCourses(resp.data)
      })
      .catch(err => {
        console.error("Erro ao carregar cursos:", err)
        setError("Não foi possível carregar a lista de cursos. Tente novamente mais tarde.")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <Container className="py-5">
      <h2 className="mb-4">Nossos Cursos</h2>
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

      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" />
        </div>
      )}

      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Row>
          {courses.map(curso => (
            <Col key={curso.id} sm={12} md={6} lg={4} className="mb-4">
              <CourseCard {...curso} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  )
}

export default Courses
