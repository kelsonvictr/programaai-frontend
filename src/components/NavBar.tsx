// src/components/NavBar.tsx
import React from "react"
import { Navbar, Nav, Container } from "react-bootstrap"
import { Link } from "react-router-dom"
import logo from "../assets/logo.png"
import styles from "./NavBar.module.css"

const NavBar: React.FC = () => (
  <Navbar expand="lg" className={styles.navbar} sticky="top">
    <Container>
      <Navbar.Brand as={Link} to="/" className={styles.brand}>
        <img src={logo} alt="Programa AI" className={styles.logo} />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="navbar-nav" />
      <Navbar.Collapse id="navbar-nav">
        <Nav className="ms-auto">
          <Nav.Link as={Link} to="/" className={styles.navLink}>
            Início
          </Nav.Link>
          <Nav.Link as={Link} to="/cursos" className={styles.navLink}>
            Cursos
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
)

export default NavBar
