import React from "react"
import { Container, Row, Col, Button, Card } from "react-bootstrap"
import { Link } from "react-router-dom"
import { FaWhatsapp } from "react-icons/fa"
import BannerCarousel from "../components/BannerCarousel"
import { courses } from "../mocks/courses"

const Home: React.FC = () => {
  const novidades = courses
    .sort((a, b) => b.id - a.id)
    .slice(0, 3)

  return (
    <>
      <BannerCarousel />

      <Container className="py-5">
        <Row className="align-items-start">
          <Col md={6} className="mb-4 mb-md-0 text-md-start text-center">
            <h1>Programação, IA e muito café.</h1>

            <div className="my-4 text-center">
              <video
                src="/videos/sala-web.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="rounded shadow"
                style={{ maxHeight: 250, maxWidth: "100%" }}
              />
            </div>

            <p className="lead">
              Cursos livres e bootcamps que te preparam para o mercado!
              Sem lenga-lenga, muita prática, IA e didática!
            </p>

            <p className="mt-3 text-muted d-flex align-items-center justify-content-md-start justify-content-center">
              <span role="img" aria-label="map">📍</span>
              <a
                href="https://www.google.com/maps/place/Empresarial+Eldorado/@-7.119502,-34.8602648,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="ms-2 text-decoration-none"
                style={{ color: "var(--color-secondary)" }}
              >
                Programa AI – Empresarial Eldorado, Sala 104<br />
                Av. Pres. Epitácio Pessoa – João Pessoa/PB
              </a>
            </p>

            <Link to="/cursos" className="btn btn-primary btn-lg">
              Conheça os Cursos
            </Link>
          </Col>

          <Col md={6}>
            <h3 className="mb-4">Novidades</h3>
            {novidades.map(curso => (
              <Card key={curso.id} className="mb-3 shadow-sm">
                <Card.Body className="p-3 d-flex justify-content-between align-items-center">
                  <div>
                    <Card.Title className="h6 mb-1">{curso.title}</Card.Title>
                    <small className="text-muted">{curso.duration}</small>
                  </div>
                  <Link
                    to={`/cursos/${curso.id}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    Ver curso
                  </Link>
                </Card.Body>
              </Card>
            ))}
          </Col>
        </Row>

        <Row className="mt-5">
          <Col>
            <Card className="shadow-sm">
              <Card.Body className="text-center">
                <Card.Title>Onde Estamos?</Card.Title>
                <Card.Text className="mb-4">
                  <span role="img" aria-label="local">📍</span>{" "}
                  Av. Pres. Epitácio Pessoa, 1133 – Estados, João Pessoa – PB<br />
                  (Empresarial Eldorado – Sala 104)
                </Card.Text>
                <Button
                  as="a"
                  href="https://wa.me/5583986608771"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="success"
                  size="lg"
                >
                  <FaWhatsapp size={20} className="me-2" />
                  Fale conosco pelo WhatsApp
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Home
