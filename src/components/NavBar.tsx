import React, { useState } from "react"
import { Navbar, Nav, Container, Button } from "react-bootstrap"
import { Link, useLocation } from "react-router-dom"
import logo from "../assets/logo.png"
import styles from "./NavBar.module.css"

const NavBar: React.FC = () => {
  const [expanded, setExpanded] = useState(false)
  const location = useLocation()

  const handleNavClick = () => {
    setTimeout(() => setExpanded(false), 3000)
  }

  const whatsappLink = `https://wa.me/5583986608771?text=${encodeURIComponent(
    "Oi prof. Kelson, venho do site da programa AI, poderia me esclarecer algumas dúvidas?"
  )}`

  return (
    <Navbar expand="lg" className={styles.navbar} sticky="top" expanded={expanded}>
      <Container>
        <Navbar.Brand as={Link} to="/" className={styles.brand}>
          <img src={logo} alt="Programa AI" className={styles.logo} />
        </Navbar.Brand>

        <Navbar.Toggle onClick={() => setExpanded(prev => !prev)} aria-controls="navbar-nav" />

        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/"
              className={styles.navLink}
              onClick={handleNavClick}
              active={location.pathname === "/"}
            >
              Início
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/cursos"
              className={styles.navLink}
              onClick={handleNavClick}
              active={location.pathname === "/cursos"}
            >
              Cursos
            </Nav.Link>
          </Nav>

          {/* Botão centralizado */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappButton}
          >
            <Button variant="success">
              📞 Fale com a gente no WhatsApp
            </Button>
          </a>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavBar
