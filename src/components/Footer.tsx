import React from "react";
import { Container } from "react-bootstrap";
import { FaLinkedin, FaInstagram, FaWhatsapp, FaMapMarkerAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer-dark">
      <Container>
        <div className="footer-content">
          <div className="footer-brand">
            <h3 className="footer-title">Programa AI</h3>
            <p className="footer-tagline">
              Transformando ideias em código desde 2023
            </p>
            <div className="footer-location">
              <FaMapMarkerAlt />
              <span>Av. Epitácio Pessoa, 1133, Sala 104 - João Pessoa/PB</span>
            </div>
          </div>

          <div className="footer-links">
            <h4>Links</h4>
            <Link to="/">Início</Link>
            <Link to="/cursos">Cursos</Link>
            <Link to="/estrutura">Estrutura</Link>
            <Link to="/lista-espera">Lista de Espera</Link>
          </div>

          <div className="footer-social">
            <h4>Siga-nos</h4>
            <div className="social-icons">
              <a
                href="https://www.linkedin.com/company/programaaidev"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
              >
                <FaLinkedin />
              </a>
              <a
                href="https://instagram.com/programaai.dev"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
              >
                <FaInstagram />
              </a>
              <a
                href={`https://wa.me/5583986608771?text=${encodeURIComponent(
                  "Oi prof. Kelson, venho do site da programa AI, poderia me esclarecer algumas dúvidas?"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp"
              >
                <FaWhatsapp />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Programa AI. Todos os direitos reservados.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
