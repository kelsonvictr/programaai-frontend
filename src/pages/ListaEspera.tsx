import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Modal } from "react-bootstrap"
import { useSearchParams } from "react-router-dom"
import api from "../api/axios"
import CourseGallery from "../components/CourseGallery"
import { FaBell, FaCheckCircle } from "react-icons/fa"
import "../styles/lista-espera-dark.css"

const CURSOS_DISPONIVEIS = [
  "Curso Presencial Programação Fullstack",
  "Programação para Iniciantes",
  "AppSec",
  "Python",
  "Java",
  "Microserviços",
  "golang",
  "Dados",
  "IA",
  "Outros"
] as const

const formatarTelefone = (valor: string) => {
  const numeros = valor.replace(/\D/g, "").slice(0, 13)
  if (!numeros) return ""

  const codigoPais = numeros.slice(0, 2)
  const ddd = numeros.slice(2, 4)
  const parte1 = numeros.slice(4, 9)
  const parte2 = numeros.slice(9, 13)

  let resultado = `+${codigoPais}`
  if (ddd) resultado += ` ${ddd}`
  if (parte1) resultado += ` ${parte1}`
  if (parte2) resultado += `-${parte2}`

  return resultado
}

const ListaEspera = () => {
  const [searchParams] = useSearchParams()
  const cursoBloqueado =
    searchParams.get("curso")?.toLowerCase() === "fullstack"

  const [nome, setNome] = useState("")
  const [curso, setCurso] = useState(
    cursoBloqueado ? "Curso Presencial Programação Fullstack" : ""
  )
  const [cursoOutro, setCursoOutro] = useState("")
  const [telefone, setTelefone] = useState(formatarTelefone("55"))
  const [email, setEmail] = useState("")
  const [comoConheceu, setComoConheceu] = useState("")
  const [mensagemErro, setMensagemErro] = useState<string | null>(null)
  const [submetendo, setSubmetendo] = useState(false)
  const [showModalSucesso, setShowModalSucesso] = useState(false)
  const handleFecharModalSucesso = () => setShowModalSucesso(false)

  useEffect(() => {
    if (cursoBloqueado) {
      setCurso("Curso Presencial Programação Fullstack")
    }
  }, [cursoBloqueado])

  const handleTelefoneChange = (evento: ChangeEvent<HTMLInputElement>) => {
    const valor = evento.target.value
    const formatado = formatarTelefone(valor)
    setTelefone(formatado)
  }

  const cursoSelecionadoEhOutro = curso === "Outros"

  const limparFormulario = () => {
    setNome("")
    setEmail("")
    setTelefone(formatarTelefone("55"))
    setComoConheceu("")
    setCursoOutro("")
    setCurso(cursoBloqueado ? "Curso Presencial Programação Fullstack" : "")
  }

  const validarFormulario = () => {
    if (!nome.trim()) {
      setMensagemErro("Informe seu nome completo.")
      return false
    }
    if (!email.trim()) {
      setMensagemErro("Informe um e-mail válido.")
      return false
    }
    if (!telefone.trim() || telefone.trim().length < 8) {
      setMensagemErro("Informe um telefone válido.")
      return false
    }
    if (!curso.trim()) {
      setMensagemErro("Escolha o curso de interesse.")
      return false
    }
    if (cursoSelecionadoEhOutro && !cursoOutro.trim()) {
      setMensagemErro("Especifique qual curso você procura.")
      return false
    }
    if (!comoConheceu.trim()) {
      setMensagemErro("Conte pra gente como conheceu o curso.")
      return false
    }
    return true
  }

  const handleSubmit = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setMensagemErro(null)
    if (!validarFormulario()) return

    const cursoParaEnvio =
      cursoSelecionadoEhOutro && cursoOutro.trim()
        ? `Outro - ${cursoOutro.trim()}`
        : curso

    const payload = {
      nome: nome.trim(),
      curso: cursoParaEnvio,
      email: email.trim(),
      telefone: telefone.trim(),
      comoConheceu: comoConheceu.trim()
    }

    try {
      setSubmetendo(true)
      await api.post("/lista-espera", payload)
      setShowModalSucesso(true)
      limparFormulario()
    } catch (erro) {
      setMensagemErro("Não foi possível enviar seus dados agora. Tente novamente em instantes.")
      console.error("Erro ao enviar lista de espera:", erro)
    } finally {
      setSubmetendo(false)
    }
  }

  return (
    <div className="lista-espera-page">
      {/* Hero Section */}
      <section className="lista-espera-hero">
        <Container>
          <div className="hero-icon">
            <FaBell />
          </div>
          <h1 className="lista-espera-hero-title">Lista de Espera</h1>
          <p className="lista-espera-hero-subtitle">
            Entre na lista e receba em primeira mão o início das inscrições da Programa AI
          </p>
        </Container>
      </section>

      <Container className="lista-espera-container">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="lista-espera-card">
              <Card.Body className="p-4 p-md-5">
                <div className="prioridade-badge">
                  <FaCheckCircle />
                  <span>Ao se cadastrar, você garante prioridade para ser avisado sobre novas turmas e novidades exclusivas.</span>
                </div>

                <div className="mb-4">
                  <h5 className="gallery-label">
                    Conheça um pouco da nossa estrutura
                  </h5>
                  <CourseGallery />
                </div>

                {mensagemErro && (
                  <Alert
                    variant="danger"
                    onClose={() => setMensagemErro(null)}
                    dismissible
                  >
                    {mensagemErro}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nome completo</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Digite seu nome completo"
                      value={nome}
                      onChange={evento => setNome(evento.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Curso</Form.Label>
                    <Form.Select
                      value={curso}
                      onChange={evento => setCurso(evento.target.value)}
                      disabled={cursoBloqueado}
                      required
                    >
                      <option value="" disabled>
                        Selecione um curso
                      </option>
                      {CURSOS_DISPONIVEIS.map(opcao => (
                        <option key={opcao} value={opcao}>
                          {opcao}
                        </option>
                      ))}
                    </Form.Select>
                    {cursoBloqueado && (
                      <Form.Text className="text-muted">
                        Curso pré-selecionado a partir do link da campanha.
                      </Form.Text>
                    )}
                  </Form.Group>

                  {cursoSelecionadoEhOutro && (
                    <Form.Group className="mb-3">
                      <Form.Label>Qual curso você procura?</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Especifique qual curso gostaria de cursar"
                        value={cursoOutro}
                        onChange={evento => setCursoOutro(evento.target.value)}
                        required
                      />
                    </Form.Group>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Telefone (WhatsApp)</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="+55 83 98888-8888"
                      value={telefone}
                      onChange={handleTelefoneChange}
                      required
                    />
                    <Form.Text className="text-muted">
                      Você pode ajustar o código do país e DDD, se necessário.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>E-mail</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="seuemail@exemplo.com"
                      value={email}
                      onChange={evento => setEmail(evento.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Como conheceu o curso?</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Instagram, indicação de amigos, anúncios..."
                      value={comoConheceu}
                      onChange={evento => setComoConheceu(evento.target.value)}
                      required
                    />
                  </Form.Group>

                  <div className="d-grid">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={submetendo}
                    >
                      {submetendo ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Enviando...
                        </>
                      ) : (
                        "Quero entrar na lista de espera"
                      )}
                    </Button>
                  </div>
                </Form>

                <Modal
                  show={showModalSucesso}
                  onHide={handleFecharModalSucesso}
                  centered
                  backdrop="static"
                  keyboard={false}
                  className="lista-espera-modal"
                >
                  <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">
                      🎉 Cadastro confirmado!
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="pt-3">
                    <p className="mb-3">
                      Recebemos seus dados e nossa equipe vai entrar em contato o mais breve possível
                      para compartilhar todas as novidades da próxima turma.
                    </p>
                    <p className="mb-0 fw-semibold text-success">
                      Você acabou de garantir prioridade na abertura das vagas! 💚
                    </p>
                  </Modal.Body>
                  <Modal.Footer className="border-0 pt-0">
                    <Button variant="primary" onClick={handleFecharModalSucesso}>
                      Voltar para o site
                    </Button>
                  </Modal.Footer>
                </Modal>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default ListaEspera
