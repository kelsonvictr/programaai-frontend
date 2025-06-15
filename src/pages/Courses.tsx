// src/pages/Courses.tsx
import React from "react"
import { Container, Row, Col } from "react-bootstrap"
import CourseCard from "../components/CourseCard"
import { courses } from "../mocks/courses"

const Courses: React.FC = () => (
  <Container className="py-5">
    <h2 className="mb-4">Nossos Cursos</h2>
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
