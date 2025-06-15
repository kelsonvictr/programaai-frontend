import React from "react";
import { Container } from "react-bootstrap";

const Footer: React.FC = () => {
  return (
    <footer>
      <Container>
        <p className="mb-0">
          © {new Date().getFullYear()} Programa AI. Todos os direitos reservados.
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
