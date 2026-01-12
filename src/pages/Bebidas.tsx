import React, { useEffect, useMemo, useState } from "react"
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner, Table } from "react-bootstrap"
import axios from "axios"

const PIX_CHAVE = "54e8d2a5-16b4-4c1b-9e70-5ee30a902579"

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
})

type Bebida = {
  id: string
  nome: string
  preco: number
  disponivel: boolean
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
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null)
  const [processing, setProcessing] = useState<"agora" | "depois" | null>(null)

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

  const addToCart = (bebida: Bebida) => {
    if (!bebida.disponivel) return
    setCheckout(null)
    setCart(prev => {
      const existing = prev[bebida.id]
      const nextQty = (existing?.quantidade || 0) + 1
      return { ...prev, [bebida.id]: { bebida, quantidade: nextQty } }
    })
  }

  const removeFromCart = (bebidaId: string) => {
    setCheckout(null)
    setCart(prev => {
      const next = { ...prev }
      delete next[bebidaId]
      return next
    })
  }

  const adjustQty = (bebidaId: string, delta: number) => {
    setCheckout(null)
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
    setProcessing(pagarAgora ? "agora" : "depois")
    setError(null)
    try {
      const payload = {
        itens: Object.values(cart).map(item => ({
          bebidaId: item.bebida.id,
          quantidade: item.quantidade
        })),
        pagarAgora,
        usuarioNome: usuarioNome.trim() || undefined
      }
      const { data } = await axios.post<CheckoutResponse>(
        `${import.meta.env.VITE_API_URL}/bebidas/pedido`,
        payload
      )
      setCheckout(data)
      setCart({})
      void fetchBebidas()
    } catch (err: any) {
      console.error(err)
      setError(err?.response?.data?.error || "Não foi possível concluir o pedido.")
    } finally {
      setProcessing(null)
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
          <div>{checkout.instrucoes}</div>
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
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h5 className="mb-1">{bebida.nome}</h5>
                              <div className="text-muted">{money.format(bebida.preco)}</div>
                            </div>
                            <Badge bg={bebida.disponivel ? "success" : "secondary"}>
                              {bebida.disponivel ? "Disponível" : "Sem estoque"}
                            </Badge>
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
                    <Form.Label>Seu nome (opcional)</Form.Label>
                    <Form.Control
                      value={usuarioNome}
                      onChange={e => setUsuarioNome(e.target.value)}
                      placeholder="Ex: João Silva"
                    />
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button
                      variant="success"
                      onClick={() => finalizarPedido(true)}
                      disabled={processing === "depois"}
                    >
                      {processing === "agora" ? "Processando..." : "Pagar agora"}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => finalizarPedido(false)}
                      disabled={processing === "agora"}
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
