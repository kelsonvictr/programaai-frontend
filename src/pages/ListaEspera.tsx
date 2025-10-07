import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap"
import { useSearchParams } from "react-router-dom"
import api from "../api/axios"

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
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null)
  const [submetendo, setSubmetendo] = useState(false)

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
      setMensagem({ tipo: "erro", texto: "Informe seu nome completo." })
      return false
    }
    if (!email.trim()) {
      setMensagem({ tipo: "erro", texto: "Informe um e-mail válido." })
      return false
    }
    if (!telefone.trim() || telefone.trim().length < 8) {
      setMensagem({ tipo: "erro", texto: "Informe um telefone válido." })
      return false
    }
    if (!curso.trim()) {
      setMensagem({ tipo: "erro", texto: "Escolha o curso de interesse." })
      return false
    }
    if (cursoSelecionadoEhOutro && !cursoOutro.trim()) {
      setMensagem({ tipo: "erro", texto: "Especifique qual curso você procura." })
      return false
    }
    if (!comoConheceu.trim()) {
      setMensagem({ tipo: "erro", texto: "Conte pra gente como conheceu o curso." })
      return false
    }
    return true
  }

  const handleSubmit = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setMensagem(null)
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
      setMensagem({
        tipo: "sucesso",
        texto: "Cadastro recebido! Você será avisado assim que abrirmos novas vagas."
      })
      limparFormulario()
    } catch (erro) {
      setMensagem({
        tipo: "erro",
        texto: "Não foi possível enviar seus dados agora. Tente novamente em instantes."
      })
      console.error("Erro ao enviar lista de espera:", erro)
    } finally {
      setSubmetendo(false)
    }
  }

  return (
    <section style={{ background: "#f7f9fc", minHeight: "100vh", padding: "60px 0" }}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <h1 className="fw-bold">Lista de Espera</h1>
                  <p className="text-muted mb-0">
                    Entre na lista e receba em primeira mão o início das inscrições da programa AI.
                  </p>
                </div>

                <Alert variant="info" className="text-center">
                  Ao se cadastrar, você garante prioridade para ser avisado sobre novas turmas e novidades exclusivas.
                </Alert>

                {mensagem && (
                  <Alert
                    variant={mensagem.tipo === "sucesso" ? "success" : "danger"}
                    onClose={() => setMensagem(null)}
                    dismissible
                  >
                    {mensagem.texto}
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
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default ListaEspera
