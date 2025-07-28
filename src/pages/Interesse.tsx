import { useState } from "react"
import { Container, Form, Button, Alert } from "react-bootstrap"

const ListaInteresse = () => {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [interesses, setInteresses] = useState<string[]>([])
  const [aceitaContato, setAceitaContato] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const opcoesInteresse = [
    "Fullstack",
    "Frontend",
    "Backend",
    "Mobile",
    "Dados",
    "Segurança",
    "Outro"
  ]

  const handleCheckboxChange = (area: string) => {
    setInteresses(prev =>
      prev.includes(area)
        ? prev.filter(item => item !== area)
        : [...prev, area]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome || !email || !whatsapp || interesses.length === 0 || !aceitaContato) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    const dados = {
      nome,
      email,
      whatsapp,
      interesses,
      aceitaContato
    }

    console.log("📩 Dados enviados (mock):", dados)
    setEnviado(true)
  }

  return (
    <Container className="mt-5 mb-5">
      <h2 className="mb-4">Entre para o Clube programa AI</h2>

      {enviado ? (
        <Alert variant="success">
          Obrigado por se cadastrar! Em breve você receberá novidades e seu cupom de 5% de desconto no e-mail.
        </Alert>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nome completo</Form.Label>
            <Form.Control
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Digite seu nome"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>E-mail</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>WhatsApp</Form.Label>
            <Form.Control
              type="tel"
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              placeholder="(83) 99999-9999"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Áreas de interesse</Form.Label>
            <div>
              {opcoesInteresse.map(area => (
                <Form.Check
                  key={area}
                  type="checkbox"
                  label={area}
                  checked={interesses.includes(area)}
                  onChange={() => handleCheckboxChange(area)}
                />
              ))}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Concordo em receber comunicações por e-mail e WhatsApp da programa AI sobre cursos nas áreas escolhidas."
              checked={aceitaContato}
              onChange={() => setAceitaContato(!aceitaContato)}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Quero entrar para o Clube
          </Button>
        </Form>
      )}
    </Container>
  )
}

export default ListaInteresse
