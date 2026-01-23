import React, { useEffect, useMemo, useState } from "react"
import { Alert, Badge, Button, Col, Container, Form, Row, Spinner } from "react-bootstrap"
import axios from "axios"
import placeholderImg from "../assets/logo.png"
import "../styles/bebidas-public.css"

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
  const [pagarAte, setPagarAte] = useState("")
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
  
  const cartCount = useMemo(() => {
    return Object.values(cart).reduce((acc, item) => acc + item.quantidade, 0)
  }, [cart])

  const hoje = new Date()
  const maxDate = new Date()
  maxDate.setDate(hoje.getDate() + 30)
  const minDateStr = hoje.toISOString().slice(0, 10)
  const maxDateStr = maxDate.toISOString().slice(0, 10)
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
    if (!pagarAgora && !pagarAte) {
      setError("Informe a data limite de pagamento.")
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
        usuarioTelefone: telefone,
        pagarAte: pagarAgora ? undefined : pagarAte
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
    } catch (err: unknown) {
      console.error(err)
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr?.response?.data?.error || "Não foi possível concluir o pedido.")
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
    <div className="bebidas-page">
      <Container className="py-5">
        <div className="bebidas-header">
          <div className="bebidas-header-icon">🧊</div>
          <h1 className="bebidas-title">Frigobar da Sala</h1>
          <p className="bebidas-subtitle">
            Escolha suas bebidas e pague via PIX agora ou combine o pagamento para depois.
          </p>
        </div>

        {error && (
          <Alert variant="danger" className="bebidas-alert">
            {error}
          </Alert>
        )}

        {checkout && (
          <div className="bebidas-checkout-success">
            <div className="checkout-success-header">
              <span className="checkout-success-icon">✓</span>
              <h3>Pedido registrado com sucesso!</h3>
            </div>
            <div className="checkout-success-details">
              <div className="checkout-detail">
                <span className="checkout-label">Pedido</span>
                <span className="checkout-value">#{checkout.id.slice(0, 8)}</span>
              </div>
              <div className="checkout-detail">
                <span className="checkout-label">Tipo</span>
                <span className="checkout-value">{checkout.tipo === "pedido" ? "Pagamento imediato" : "Agendado"}</span>
              </div>
              <div className="checkout-detail highlight">
                <span className="checkout-label">Total</span>
                <span className="checkout-value">{money.format(checkout.total)}</span>
              </div>
            </div>
            <div className="checkout-pix-section">
              <div className="pix-qr-wrapper">
                <img
                  src={PIX_QR_PATH}
                  alt="QR code PIX"
                  className="pix-qr-code"
                  onError={e => {
                    const img = e.currentTarget
                    img.style.display = "none"
                  }}
                />
              </div>
              <div className="pix-info">
                <div className="pix-key-label">Chave PIX (copia e cola):</div>
                <div className="pix-key-value">{checkout.pixChave || PIX_CHAVE}</div>
                <div className="pix-actions">
                  <Button
                    className={`pix-copy-btn ${copyOk ? 'copied' : ''}`}
                    onClick={() => copiarChavePix(checkout.pixChave || PIX_CHAVE)}
                  >
                    {copyOk ? "✓ Copiada!" : "📋 Copiar chave PIX"}
                  </Button>
                  <Button
                    className={`pix-confirm-btn ${informado ? 'confirmed' : ''}`}
                    onClick={informarPagamento}
                    disabled={informando || informado}
                  >
                    {informando ? "Enviando..." : informado ? "✓ Pagamento informado" : "💰 Informar pagamento"}
                  </Button>
                </div>
                <p className="pix-hint">
                  Após realizar o PIX, clique em <strong>Informar pagamento</strong> para avisar a equipe.
                </p>
              </div>
            </div>
          </div>
        )}

        <Row className="g-4">
          <Col xs={12} lg={7}>
            <div className="bebidas-section">
              <h2 className="bebidas-section-title">
                <span className="section-icon">🥤</span>
                Bebidas disponíveis
              </h2>
              
              {loading && (
                <div className="bebidas-loading">
                  <Spinner animation="border" variant="primary" />
                  <span>Carregando bebidas...</span>
                </div>
              )}
              
              {!loading && bebidas.length === 0 && (
                <div className="bebidas-empty">
                  <span className="empty-icon">🍹</span>
                  <p>Nenhuma bebida disponível no momento.</p>
                </div>
              )}
              
              {!loading && bebidas.length > 0 && (
                <div className="bebidas-grid">
                  {bebidas.map(bebida => {
                    const cartItem = cart[bebida.id]
                    const qtyInCart = cartItem?.quantidade || 0
                    
                    return (
                      <div 
                        key={bebida.id} 
                        className={`bebida-card ${!bebida.disponivel ? 'out-of-stock' : ''} ${qtyInCart > 0 ? 'in-cart' : ''}`}
                      >
                        <div className="bebida-image-wrapper">
                          <img
                            src={bebida.imagemUrl || placeholderImg}
                            alt={bebida.nome}
                            className="bebida-image"
                            onError={e => {
                              const img = e.currentTarget
                              img.src = placeholderImg
                            }}
                          />
                          {qtyInCart > 0 && (
                            <div className="bebida-cart-badge">{qtyInCart}</div>
                          )}
                          <Badge className={`bebida-status ${bebida.disponivel ? 'available' : 'unavailable'}`}>
                            {bebida.disponivel ? "Disponível" : "Sem estoque"}
                          </Badge>
                        </div>
                        <div className="bebida-info">
                          <h3 className="bebida-name">{bebida.nome}</h3>
                          <div className="bebida-price">{money.format(bebida.preco)}</div>
                        </div>
                        <Button
                          className="bebida-add-btn"
                          disabled={!bebida.disponivel}
                          onClick={() => addToCart(bebida)}
                        >
                          {qtyInCart > 0 ? "+ Adicionar mais" : "+ Adicionar"}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </Col>

          <Col xs={12} lg={5}>
            <div className="cart-section">
              <h2 className="cart-title">
                <span className="section-icon">🛒</span>
                Carrinho
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </h2>
              
              {Object.keys(cart).length === 0 ? (
                <div className="cart-empty">
                  <span className="cart-empty-icon">🛒</span>
                  <p>Seu carrinho está vazio</p>
                  <span className="cart-empty-hint">Adicione bebidas para começar</span>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    {Object.values(cart).map(item => (
                      <div key={item.bebida.id} className="cart-item">
                        <div className="cart-item-info">
                          <span className="cart-item-name">{item.bebida.nome}</span>
                          <span className="cart-item-price">{money.format(item.bebida.preco)} cada</span>
                        </div>
                        <div className="cart-item-controls">
                          <div className="qty-controls">
                            <button 
                              className="qty-btn"
                              onClick={() => adjustQty(item.bebida.id, -1)}
                            >
                              −
                            </button>
                            <span className="qty-value">{item.quantidade}</span>
                            <button 
                              className="qty-btn"
                              onClick={() => adjustQty(item.bebida.id, 1)}
                            >
                              +
                            </button>
                          </div>
                          <span className="cart-item-subtotal">
                            {money.format(item.bebida.preco * item.quantidade)}
                          </span>
                          <button 
                            className="cart-item-remove"
                            onClick={() => removeFromCart(item.bebida.id)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cart-total">
                    <span>Total</span>
                    <span className="total-value">{money.format(total)}</span>
                  </div>

                  <div className="cart-form">
                    <h3 className="cart-form-title">Seus dados</h3>
                    
                    <Form.Group className="cart-form-group">
                      <Form.Label>Nome completo</Form.Label>
                      <Form.Control
                        value={usuarioNome}
                        onChange={e => setUsuarioNome(e.target.value)}
                        placeholder="Ex: João Silva"
                        required
                      />
                    </Form.Group>
                    
                    <Row className="g-2">
                      <Col xs={6}>
                        <Form.Group className="cart-form-group">
                          <Form.Label>CPF</Form.Label>
                          <Form.Control
                            value={usuarioCpf}
                            onChange={e => setUsuarioCpf(e.target.value)}
                            placeholder="Somente números"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={6}>
                        <Form.Group className="cart-form-group">
                          <Form.Label>Telefone</Form.Label>
                          <Form.Control
                            value={usuarioTelefone}
                            onChange={e => setUsuarioTelefone(e.target.value)}
                            placeholder="(83) 99999-9999"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="cart-form-group">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={usuarioEmail}
                        onChange={e => setUsuarioEmail(e.target.value)}
                        placeholder="exemplo@email.com"
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="cart-form-group">
                      <Form.Label>Data limite para pagamento</Form.Label>
                      <Form.Control
                        type="date"
                        value={pagarAte}
                        min={minDateStr}
                        max={maxDateStr}
                        onChange={e => setPagarAte(e.target.value)}
                      />
                      <Form.Text>
                        Escolha uma data (obrigatória para "Pagar depois")
                      </Form.Text>
                    </Form.Group>

                    <div className="cart-actions">
                      <Button
                        className="cart-btn-primary"
                        onClick={() => finalizarPedido(true)}
                        disabled={processing === "depois" || !formOk}
                      >
                        {processing === "agora" ? (
                          <>
                            <Spinner size="sm" animation="border" /> Processando...
                          </>
                        ) : (
                          <>💳 Pagar agora</>
                        )}
                      </Button>
                      <Button
                        className="cart-btn-secondary"
                        onClick={() => finalizarPedido(false)}
                        disabled={processing === "agora" || !formOk || !pagarAte}
                      >
                        {processing === "depois" ? (
                          <>
                            <Spinner size="sm" animation="border" /> Processando...
                          </>
                        ) : (
                          <>📅 Pagar depois</>
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Bebidas
