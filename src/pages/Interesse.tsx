import { useState } from "react"
import {
  Container,
  Form,
  Button,
  Alert,
  Modal,
  Row,
  Col
} from "react-bootstrap"
import axios from "axios"

const ListaInteresse = () => {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [interesses, setInteresses] = useState<string[]>([])
  const [aceitaContato, setAceitaContato] = useState(false)
  const [website, setWebsite] = useState("") // honeypot

  const [showModalSucesso, setShowModalSucesso] = useState(false)
  const [showModalRegras, setShowModalRegras] = useState(false)

  const opcoesInteresse = [
    "Programação do Zero",
    "Lógica de Programação",
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

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (website) return

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

    try {
        await axios.post(
        `${import.meta.env.VITE_API_URL}/clube/interesse`, 
        dados
        )

        setShowModalSucesso(true)
    } catch (error) {
        console.error("❌ Erro ao enviar:", error)
        alert("Ocorreu um erro ao enviar seus dados. Tente novamente mais tarde.")
    }
    }
  return (
    <Container className="mt-5 mb-5">
      <Alert variant="info" className="text-center">
        🎁 <strong>É totalmente gratuito</strong> entrar no Clube programa AI e você já garante <strong>5% de desconto</strong> em qualquer curso!
      </Alert>

      <h2 className="mb-4 text-center">Entre para o Clube programa AI</h2>

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

        {/* Honeypot - campo invisível */}
        <Form.Group className="mb-3 d-none">
          <Form.Label>Website</Form.Label>
          <Form.Control
            type="text"
            name="website"
            value={website}
            onChange={e => setWebsite(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Áreas de interesse</Form.Label>
          <Row>
            {opcoesInteresse.map(area => (
              <Col xs={12} sm={6} md={4} key={area}>
                <Form.Check
                  type="checkbox"
                  label={area}
                  checked={interesses.includes(area)}
                  onChange={() => handleCheckboxChange(area)}
                />
              </Col>
            ))}
          </Row>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Check
            type="checkbox"
            label={
              <>
                Concordo em receber comunicações por e-mail e WhatsApp da programa AI sobre cursos nas áreas escolhidas.
                <br />
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowModalRegras(true)
                  }}
                  style={{ fontSize: "0.9rem" }}
                >
                  Ver regras do Clube
                </a>
              </>
            }
            checked={aceitaContato}
            onChange={() => setAceitaContato(!aceitaContato)}
            required
          />
        </Form.Group>

        <div className="text-center">
          <Button variant="primary" type="submit" size="lg">
            Quero entrar para o Clube
          </Button>
        </div>
      </Form>

      {/* Modal de sucesso */}
      <Modal show={showModalSucesso} onHide={() => setShowModalSucesso(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>🎉 Bem-vindo(a) ao Clube programa AI!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Você agora tem <strong>5% de desconto garantido</strong> em qualquer curso. Em breve entraremos em contato com mais novidades!
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={() => setShowModalSucesso(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de regras */}
      <Modal show={showModalRegras} onHide={() => setShowModalRegras(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>📜 Regras do Clube programa AI</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul>
            <li>A entrada é 100% gratuita.</li>
            <li>O desconto de 5% é válido para qualquer curso enquanto a promoção estiver ativa.</li>
            <li>A promoção pode ser encerrada a qualquer momento, sem aviso prévio.</li>
            <li>Você receberá comunicações por e-mail ou WhatsApp conforme suas áreas de interesse.</li>
            <li>O desconto não é acumulativo com outras promoções.</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalRegras(false)}>
            Entendi
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default ListaInteresse
