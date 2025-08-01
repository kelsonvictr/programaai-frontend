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
import { useNavigate } from "react-router-dom" 

const ListaInteresse = () => {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [interesses, setInteresses] = useState<string[]>([])
  const [aceitaContato, setAceitaContato] = useState(false)
  const [website, setWebsite] = useState("") // honeypot
  const [enviando, setEnviando] = useState(false)

  const [showModalSucesso, setShowModalSucesso] = useState(false)
  const [showModalRegras, setShowModalRegras] = useState(false)
  const [showModalJaCadastrado, setShowModalJaCadastrado] = useState(false) 

  const navigate = useNavigate() 

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

  const formatarWhatsapp = (valor: string) => {
    let apenasNumeros = valor.replace(/\D/g, "")
    if (!apenasNumeros.startsWith("55")) apenasNumeros = "55" + apenasNumeros
    apenasNumeros = apenasNumeros.slice(0, 13)

    const pais = apenasNumeros.substring(0, 2)
    const ddd = apenasNumeros.substring(2, 4)
    const parte1 = apenasNumeros.substring(4, 9)
    const parte2 = apenasNumeros.substring(9, 13)

    if (parte2) return `+${pais} (${ddd}) ${parte1}-${parte2}`
    if (parte1) return `+${pais} (${ddd}) ${parte1}`
    if (ddd) return `+${pais} (${ddd}`
    if (pais) return `+${pais}`
    return ""
  }

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(formatarWhatsapp(e.target.value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (website) return

    if (!nome || !email || !whatsapp || interesses.length === 0 || !aceitaContato) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    const dados = { nome, email, whatsapp, interesses, aceitaContato }

    try {
      setEnviando(true)
      await axios.post(
        `${import.meta.env.VITE_API_URL}/clube/interesse`,
        dados
      )
      setShowModalSucesso(true)
    } catch (error: any) {
      console.error("❌ Erro ao enviar:", error)

      // ✅ Tratando o caso de e-mail duplicado (409 Conflict)
      if (error.response && error.response.status === 409) {
        setShowModalJaCadastrado(true)
      } else {
        alert("Ocorreu um erro ao enviar seus dados. Tente novamente mais tarde.")
      }
    } finally {
      setEnviando(false)
    }
  }

  const fecharModalSucesso = () => {
    setShowModalSucesso(false)
    navigate("/")
  }

  return (
    <Container className="mt-5 mb-5">
      <Alert variant="info" className="text-center">
        🎁 <strong>É totalmente gratuito</strong> entrar no Clube programa AI e você já garante <strong>5% de desconto</strong> em qualquer curso!
      </Alert>

      <h2 className="mb-4 text-center">Entre para o Clube programa AI</h2>

      <Form onSubmit={handleSubmit}>
        {/* Campos do formulário */}
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
            onChange={handleWhatsappChange}
            placeholder="+55 (83) 99999-9999"
            required
          />
        </Form.Group>

        {/* Honeypot oculto */}
        <Form.Group className="mb-3 d-none">
          <Form.Label>Website</Form.Label>
          <Form.Control
            type="text"
            name="website"
            value={website}
            onChange={e => setWebsite(e.target.value)}
          />
        </Form.Group>

        {/* Checkboxes de interesse */}
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

        {/* Aceite */}
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
          <Button 
            variant="primary" 
            type="submit" 
            size="lg" 
            disabled={!aceitaContato || enviando}
          >
            {enviando ? "Enviando..." : "Quero entrar para o Clube"}
          </Button>
        </div>
      </Form>

      {/* Modal de sucesso */}
      <Modal show={showModalSucesso} onHide={fecharModalSucesso} centered>
        <Modal.Header closeButton>
          <Modal.Title>🎉 Bem-vindo(a) ao Clube programa AI!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Você agora tem <strong>5% de desconto garantido</strong> em qualquer curso. Em breve entraremos em contato com mais novidades!
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={fecharModalSucesso}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal já cadastrado */}
      <Modal show={showModalJaCadastrado} onHide={() => setShowModalJaCadastrado(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>📩 Você já faz parte do Clube!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          O e-mail informado já está cadastrado no <b>Clube programa AI</b>.  
          Você já pode aproveitar <strong>5% de desconto</strong> em nossos cursos. 🚀
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={() => setShowModalJaCadastrado(false)}>
            Entendi!
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
