// src/pages/Courses.tsx
import React from "react"
import { Container, Row, Col } from "react-bootstrap"
import CourseCard from "../components/CourseCard"
import { courses } from "../mocks/courses"
import { Button } from 'react-bootstrap'
import { FaWhatsapp } from "react-icons/fa"

const Courses: React.FC = () => (
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
    >
      <FaWhatsapp size={20} className="me-2" />
      Fala com a gente pelo WhatsApp
    </Button>
    <Row>
      {courses.map(curso => (
        <Col key={curso.id} sm={12} md={6} lg={4}>
          <CourseCard {...curso} />
        </Col>
      ))}
    </Row>
  </Container>
)

export default Courses
