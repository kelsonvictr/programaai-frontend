// src/pages/Contact.tsx
import React from "react";
import { Container, Button } from "react-bootstrap";

const Contact: React.FC = () => {
  return (
    <Container className="py-5 text-center">
      <h2>Contato</h2>
      <p className="mt-4">
        <span role="img" aria-label="localização">📍</span>{" "}
        Av. Pres. Epitácio Pessoa, 1133 - Estados, João Pessoa - PB<br/>
        (Empresarial Eldorado - Sala 104)
      </p>
      <Button
        as="a"
        href="https://wa.me/5583986608771"
        target="_blank"
        rel="noopener noreferrer"
        variant="success"
        size="lg"
        className="mt-3"
      >
        Fale conosco pelo WhatsApp
      </Button>
    </Container>
  );
};

export default Contact;
