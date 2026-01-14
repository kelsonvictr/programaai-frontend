import React, { useEffect, useMemo, useState } from "react"
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner, Table } from "react-bootstrap"
import axios from "axios"
import placeholderImg from "../assets/logo.png"

const PIX_CHAVE = "54e8d2a5-16b4-4c1b-9e70-5ee30a902579"
const PIX_QR_PATH = "/qr.jpeg"

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
})

type Bebida = {
  id: string
  nome: string
  preco: number
  disponivel: boolean
  imagemUrl?: string | null
}

type CartItem = {
  bebida: Bebida
  quantidade: number
}

type CheckoutResponse = {
  id: string
  tipo: "pedido" | "agendamento"
  total: number
  pixChave: string
  instrucoes: string
}

const Bebidas: React.FC = () => {
  const [bebidas, setBebidas] = useState<Bebida[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cart, setCart] = useState<Record<string, CartItem>>({})
  const [usuarioNome, setUsuarioNome] = useState("")
  const [usuarioCpf, setUsuarioCpf] = useState("")
  const [usuarioEmail, setUsuarioEmail] = useState("")
  const [usuarioTelefone, setUsuarioTelefone] = useState("")
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null)
  const [processing, setProcessing] = useState<"agora" | "depois" | null>(null)
  const [copyOk, setCopyOk] = useState(false)
  const [informando, setInformando] = useState(false)
  const [informado, setInformado] = useState(false)

  const fetchBebidas = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get<{ bebidas: Bebida[] }>(
        `${import.meta.env.VITE_API_URL}/bebidas`
      )
      setBebidas(data.bebidas || [])
    } catch (err) {
      console.error(err)
      setError("Não foi possível carregar as bebidas disponíveis.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchBebidas()
  }, [])

  const total = useMemo(() => {
    return Object.values(cart).reduce((acc, item) => acc + item.bebida.preco * item.quantidade, 0)
  }, [cart])
  const formOk = Boolean(
    usuarioNome.trim() &&
      usuarioCpf.trim() &&
      usuarioEmail.trim() &&
      usuarioTelefone.trim()
  )

  const addToCart = (bebida: Bebida) => {
    if (!bebida.disponivel) return
    setCheckout(null)
    setCopyOk(false)
    setInformado(false)
    setCart(prev => {
      const existing = prev[bebida.id]
      const nextQty = (existing?.quantidade || 0) + 1
      return { ...prev, [bebida.id]: { bebida, quantidade: nextQty } }
    })
  }

  const removeFromCart = (bebidaId: string) => {
    setCheckout(null)
    setCopyOk(false)
    setInformado(false)
    setCart(prev => {
      const next = { ...prev }
      delete next[bebidaId]
      return next
    })
  }

  const adjustQty = (bebidaId: string, delta: number) => {
    setCheckout(null)
    setCopyOk(false)
    setInformado(false)
    setCart(prev => {
      const existing = prev[bebidaId]
      if (!existing) return prev
      const nextQty = existing.quantidade + delta
      if (nextQty <= 0) {
        const next = { ...prev }
        delete next[bebidaId]
        return next
      }
      return { ...prev, [bebidaId]: { ...existing, quantidade: nextQty } }
    })
  }

  const finalizarPedido = async (pagarAgora: boolean) => {
    if (!Object.keys(cart).length) return
    const nome = usuarioNome.trim()
    const cpf = usuarioCpf.trim()
    const email = usuarioEmail.trim()
    const telefone = usuarioTelefone.trim()
    if (!nome || !cpf || !email || !telefone) {
      setError("Informe nome, CPF, e-mail e telefone antes de continuar.")
      return
    }
    setProcessing(pagarAgora ? "agora" : "depois")
    setError(null)
    try {
      const payload = {
        itens: Object.values(cart).map(item => ({
          bebidaId: item.bebida.id,
          quantidade: item.quantidade
        })),
        pagarAgora,
        usuarioNome: nome,
        usuarioCpf: cpf,
        usuarioEmail: email,
        usuarioTelefone: telefone
      }
      const { data } = await axios.post<CheckoutResponse>(
        `${import.meta.env.VITE_API_URL}/bebidas/pedido`,
        payload
      )
      setCheckout(data)
      setCopyOk(false)
      setInformado(false)
      setCart({})
      void fetchBebidas()
    } catch (err: any) {
      console.error(err)
      setError(err?.response?.data?.error || "Não foi possível concluir o pedido.")
    } finally {
      setProcessing(null)
    }
  }

  const copiarChavePix = async (valor: string) => {
    try {
      await navigator.clipboard.writeText(valor)
      setCopyOk(true)
      setTimeout(() => setCopyOk(false), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  const informarPagamento = async () => {
    if (!checkout?.id) return
    setInformando(true)
    setError(null)
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/bebidas/pedido/informar`, {
        pedidoId: checkout.id
      })
      setInformado(true)
    } catch (err) {
      console.error(err)
      setError("Não foi possível informar o pagamento agora.")
    } finally {
      setInformando(false)
    }
  }

  return (
    <Container className="py-5" style={{ maxWidth: 1100 }}>
      <Row className="mb-4">
        <Col>
          <h2 className="mb-2">Frigobar da Sala</h2>
          <p className="text-muted mb-0">
            Escolha suas bebidas e pague via PIX agora ou combine o pagamento para depois.
          </p>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {checkout && (
        <Alert variant="success">
          <div className="mb-2">
            Pedido <strong>#{checkout.id}</strong> registrado ({checkout.tipo}).
          </div>
          <div className="mb-2">
            Valor total: <strong>{money.format(checkout.total)}</strong>
          </div>
          <div className="mb-2">
            Chave PIX: <strong>{checkout.pixChave || PIX_CHAVE}</strong>
          </div>
          <div className="d-flex flex-column flex-md-row gap-3 align-items-start">
            <img
              src={PIX_QR_PATH}
              alt="QR code PIX"
              style={{ width: 140, height: 140, objectFit: "cover", borderRadius: 8 }}
              onError={e => {
                const img = e.currentTarget
                img.style.display = "none"
              }}
            />
            <div>
              <div className="mb-2">{checkout.instrucoes}</div>
              <div className="d-flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={copyOk ? "success" : "outline-primary"}
                  onClick={() => copiarChavePix(checkout.pixChave || PIX_CHAVE)}
                >
                  {copyOk ? "Chave copiada" : "Copiar chave PIX"}
                </Button>
                <Button
                  size="sm"
                  variant={informado ? "success" : "primary"}
                  onClick={informarPagamento}
                  disabled={informando || informado}
                >
                  {informando
                    ? "Enviando..."
                    : informado
                      ? "Pagamento informado"
                      : "Informar pagamento"}
                </Button>
              </div>
              <div className="text-muted small mt-2">
                Após realizar o PIX, clique em <strong>Informar pagamento</strong> para avisar a equipe.
              </div>
            </div>
          </div>
        </Alert>
      )}

      <Row className="g-4">
        <Col xs={12} lg={7}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="mb-3">Bebidas disponíveis</Card.Title>
              {loading && (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                </div>
              )}
              {!loading && bebidas.length === 0 && (
                <Alert variant="info" className="mb-0">
                  Nenhuma bebida disponível no momento.
                </Alert>
              )}
              {!loading && bebidas.length > 0 && (
                <Row className="g-3">
                  {bebidas.map(bebida => (
                    <Col xs={12} md={6} key={bebida.id}>
                      <Card className="h-100 border">
                        <Card.Body className="d-flex flex-column">
                          <div className="d-flex gap-3 align-items-start mb-2">
                            <img
                              src={bebida.imagemUrl || placeholderImg}
                              alt={bebida.nome}
                              style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 10 }}
                              onError={e => {
                                const img = e.currentTarget
                                img.src = placeholderImg
                              }}
                            />
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <h5 className="mb-1">{bebida.nome}</h5>
                                  <div className="text-muted">{money.format(bebida.preco)}</div>
                                </div>
                                <Badge bg={bebida.disponivel ? "success" : "secondary"}>
                                  {bebida.disponivel ? "Disponível" : "Sem estoque"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="mt-auto">
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={!bebida.disponivel}
                              onClick={() => addToCart(bebida)}
                            >
                              Adicionar ao carrinho
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={5}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="mb-3">Carrinho</Card.Title>
              {Object.keys(cart).length === 0 && (
                <Alert variant="light" className="mb-0">
                  Seu carrinho está vazio.
                </Alert>
              )}
              {Object.keys(cart).length > 0 && (
                <>
                  <Table responsive size="sm" className="align-middle">
                    <thead>
                      <tr>
                        <th>Bebida</th>
                        <th>Qtd</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(cart).map(item => (
                        <tr key={item.bebida.id}>
                          <td>{item.bebida.nome}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => adjustQty(item.bebida.id, -1)}
                              >
                                -
                              </Button>
                              <span>{item.quantidade}</span>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => adjustQty(item.bebida.id, 1)}
                              >
                                +
                              </Button>
                            </div>
                          </td>
                          <td>{money.format(item.bebida.preco * item.quantidade)}</td>
                          <td className="text-end">
                            <Button
                              variant="link"
                              size="sm"
                              className="text-danger"
                              onClick={() => removeFromCart(item.bebida.id)}
                            >
                              Remover
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <strong>Total</strong>
                    <strong>{money.format(total)}</strong>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label>Nome completo</Form.Label>
                    <Form.Control
                      value={usuarioNome}
                      onChange={e => setUsuarioNome(e.target.value)}
                      placeholder="Ex: João Silva"
                      required
                    />
                  </Form.Group>
                  <Row className="g-2">
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>CPF</Form.Label>
                        <Form.Control
                          value={usuarioCpf}
                          onChange={e => setUsuarioCpf(e.target.value)}
                          placeholder="Somente números"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Telefone</Form.Label>
                        <Form.Control
                          value={usuarioTelefone}
                          onChange={e => setUsuarioTelefone(e.target.value)}
                          placeholder="Ex: (83) 99999-9999"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={usuarioEmail}
                      onChange={e => setUsuarioEmail(e.target.value)}
                      placeholder="exemplo@email.com"
                      required
                    />
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button
                      variant="success"
                      onClick={() => finalizarPedido(true)}
                      disabled={processing === "depois" || !formOk}
                    >
                      {processing === "agora" ? "Processando..." : "Pagar agora"}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => finalizarPedido(false)}
                      disabled={processing === "agora" || !formOk}
                    >
                      {processing === "depois" ? "Processando..." : "Pagar depois"}
                    </Button>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Bebidas
