import React, { useState } from "react"
import { Navbar, Nav, Container } from "react-bootstrap"
import { Link, useLocation } from "react-router-dom"
import logo from "../assets/logo-dourada.png"
import styles from "./NavBar.module.css"

const NavBar: React.FC = () => {
  const [expanded, setExpanded] = useState(false)
  const location = useLocation()

  const handleNavClick = () => {
    // Aguarda 3 segundos antes de fechar o menu
    setTimeout(() => setExpanded(false), 3000)
  }

  return (
    <Navbar expand="lg" className={styles.navbar} sticky="top" expanded={expanded}>
      <Container>
        <Navbar.Brand as={Link} to="/" className={styles.brand}>
          <img src={logo} alt="Programa AI" className={styles.logo} />
        </Navbar.Brand>

        <Navbar.Toggle onClick={() => setExpanded(prev => !prev)} aria-controls="navbar-nav" />

        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
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
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavBar
