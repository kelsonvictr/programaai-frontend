// src/pages/Pagamento.tsx

import React, { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Container, Row, Col, Button, Alert, Spinner, Card,
  Placeholder, Badge, Modal
} from "react-bootstrap"
import axios from "axios"
import { FaQrcode, FaCreditCard } from "react-icons/fa"
import { BsFileEarmarkText } from "react-icons/bs"
import "./Pagamento.css"

type LoadingKind = "PIX" | "CARTAO" | "ASSINATURA" | null

type PagamentoInfo = {
  inscricaoId: string
  curso: { title: string; ativo: boolean }
  precoBase: number
  precoBaseFmt: string
  pix: {
    valor: number
    valorFmt: string
    descontoExtraAplicado: number
    descontoExtraAplicadoFmt: string
    mensagem: string
  }
  cartao: {
    valor: number
    valorFmt: string
    ate12x: { parcelas: number; valorParcela: number; valorParcelaFmt: string }
    mensagem: string
  }
  mensalidades: {
    disponivel: boolean
    parcelas: number
    valorParcela: number
    valorParcelaFmt: string
    mensagem: string
  }
  assinatura?: {
    solicitada: boolean
    solicitadaEm?: string
  }
  observacoesCurso: {
    obsPrice: string
    modalidade: string
    horario: string
  }
}

const isBadId = (v?: string) =>
  !v || v.trim() === "" || v === "null" || v === "undefined"

const Pagamento: React.FC = () => {
  const { inscricaoId } = useParams<{ inscricaoId?: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState<LoadingKind>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [info, setInfo] = useState<PagamentoInfo | null>(null)
  const [loadingInfo, setLoadingInfo] = useState<boolean>(true)

  // modais
  const [showConfirmAssinatura, setShowConfirmAssinatura] = useState(false)
  const [showDoneAssinatura, setShowDoneAssinatura] = useState(false)

  // Força o tema dark na página inteira - SEMPRE DARK
  useEffect(() => {
    const root = document.getElementById('root')
    const body = document.body
    const html = document.documentElement
    const main = document.querySelector('main')

    // Salva estilos originais
    const originalRootStyle = root?.style.cssText || ''
    const originalBodyStyle = body.style.cssText
    const originalHtmlStyle = html.style.cssText
    const originalMainStyle = main ? (main as HTMLElement).style.cssText : ''

    // FORÇA DARK - SEM CONDIÇÕES
    const bgColor = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    
    if (root) {
      root.style.cssText = `
        max-width: none !important;
        padding: 0 !important;
        background: transparent !important;
      `
    }
    
    body.style.cssText = `
      background: ${bgColor} !important;
      margin: 0 !important;
      padding: 0 !important;
      min-height: 100vh !important;
    `
    
    html.style.cssText = `
      background: ${bgColor} !important;
      margin: 0 !important;
      padding: 0 !important;
    `
    
    if (main) {
      (main as HTMLElement).style.cssText = `
        background: ${bgColor} !important;
        margin: 0 !important;
        padding: 0 !important;
      `
    }

    // Força todos os containers do Bootstrap
    const containers = document.querySelectorAll('.container, .container-fluid')
    containers.forEach(container => {
      (container as HTMLElement).style.background = 'transparent'
    })

    // Restaura estilos ao desmontar
    return () => {
      if (root) root.style.cssText = originalRootStyle
      body.style.cssText = originalBodyStyle
      html.style.cssText = originalHtmlStyle
      if (main) (main as HTMLElement).style.cssText = originalMainStyle
    }
  }, [])

  useEffect(() => {
    if (isBadId(inscricaoId)) {
      navigate("/", { replace: true })
    }
  }, [inscricaoId, navigate])

  const validInscricaoId = useMemo(() => !isBadId(inscricaoId) ? inscricaoId! : null, [inscricaoId])

  useEffect(() => {
    if (!validInscricaoId) return
    let mounted = true
    ;(async () => {
      setLoadingInfo(true)
      setError(null)
      try {
        const resp = await axios.get<PagamentoInfo>(
          `${import.meta.env.VITE_API_URL}/pagamento-info`,
          { params: { inscricaoId: validInscricaoId } }
        )
        if (mounted) setInfo(resp.data)
      } catch (err) {
        console.error("Erro ao obter pagamento-info", err)
        if (mounted) setError("Não foi possível carregar as informações de pagamento.")
      } finally {
        if (mounted) setLoadingInfo(false)
      }
    })()
    return () => { mounted = false }
  }, [validInscricaoId])

  const handlePayment = async (method: "PIX" | "CARTAO") => {
    if (!validInscricaoId) return
    setError(null)
    setSuccessMsg(null)
    setLoading(method)
    try {
      const resp = await axios.post<{ url?: string }>(
        `${import.meta.env.VITE_API_URL}/paymentlink`,
        { inscricaoId: validInscricaoId, paymentMethod: method }
      )
      const url = resp.data?.url
      if (!url) {
        setError("Não foi possível gerar o link de pagamento. Tente novamente.")
        setLoading(null)
        return
      }
      window.location.href = url
    } catch (err) {
      console.error("Erro ao gerar link de pagamento", err)
      setError("Não foi possível gerar o link de pagamento. Tente novamente.")
      setLoading(null)
    }
  }

  // abre modal de confirmação da assinatura
  const openAssinaturaModal = () => setShowConfirmAssinatura(true)
  const closeAssinaturaModal = () => setShowConfirmAssinatura(false)

  // confirma a assinatura (chama API)
  const confirmAssinatura = async () => {
    if (!validInscricaoId) return
    setError(null)
    setSuccessMsg(null)
    setLoading("ASSINATURA")
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/isAssinatura`, {
        inscricaoId: validInscricaoId,
        isAssinatura: true
      })
      // marca localmente como solicitado para desabilitar botão
      setInfo(prev => prev ? {
        ...prev,
        assinatura: { solicitada: true, solicitadaEm: new Date().toISOString() }
      } : prev)
      setShowConfirmAssinatura(false)
      setShowDoneAssinatura(true)
    } catch (err) {
      console.error("Erro ao solicitar assinatura", err)
      setError("Não foi possível registrar sua solicitação de assinatura. Tente novamente.")
    } finally {
      setLoading(null)
    }
  }

  const closeDoneModal = () => {
    setShowDoneAssinatura(false)
    navigate("/", { replace: true })
  }

  const PriceSkeleton = () => (
    <Card className="shadow-sm mb-4">
      <Card.Body>
        <Placeholder as={Card.Title} animation="wave" className="mb-2">
          <Placeholder xs={6} />
        </Placeholder>
        <Placeholder as="p" animation="wave" className="mb-1">
          <Placeholder xs={8} />
        </Placeholder>
        <Placeholder as="p" animation="wave" className="mb-0">
          <Placeholder xs={5} />
        </Placeholder>
      </Card.Body>
    </Card>
  )

  const BigActionButton: React.FC<{
    variant: "success" | "primary" | "outline-secondary"
    loading: boolean
    icon: React.ReactNode
    title: string
    subtitle?: string
    onClick?: () => void
    disabled?: boolean
  }> = ({ variant, loading, icon, title, subtitle, onClick, disabled }) => (
    <Button
      variant={variant}
      size="lg"
      className="w-100 d-flex flex-column align-items-center justify-content-center text-center"
      style={{ lineHeight: 1.1, minHeight: 72 }}
      onClick={onClick}
      disabled={disabled}
    >
      {loading ? (
        <Spinner animation="border" size="sm" className="mb-2" />
      ) : (
        <div className="mb-2" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon}
          <span>{title}</span>
        </div>
      )}
      <small className="d-block" style={{ fontSize: "0.8em", opacity: 0.9 }}>
        {subtitle || "\u00A0"}
      </small>
    </Button>
  )

  if (!validInscricaoId) return null

  const assinaturaJaSolicitada = !!info?.assinatura?.solicitada

  return (
    <div 
      className="pagamento-page"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        margin: 0,
        padding: 0
      }}
    >
      <Container className="py-5" style={{ maxWidth: 820, background: 'transparent' }}>
      <Alert variant="info" className="mb-4">
        <strong>Sua inscrição foi recebida</strong>, mas <strong>só será confirmada após a confirmação do pagamento</strong>.{" "}
        Após a confirmação, entraremos em contato com mais informações sobre o seu curso. 🚀
      </Alert>

      <h2 className="text-center mb-2">Pagamento da Inscrição</h2>
      <p className="text-center text-muted mb-4">
        <small>ID da inscrição: <strong>#{validInscricaoId}</strong></small>
      </p>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      {successMsg && <Alert variant="success" className="mb-4">{successMsg}</Alert>}

      {loadingInfo && <PriceSkeleton />}
      {!loadingInfo && info && (
        <Card className="shadow-sm mb-4 bg-body">
          <Card.Body>
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-2">
              <Card.Title className="mb-1">
                {info.curso.title}{" "}
                {!info.curso.ativo && <Badge bg="secondary" className="ms-2">Encerrado</Badge>}
              </Card.Title>
              <div className="text-muted small">
                {info.observacoesCurso.modalidade && <span className="me-3">{info.observacoesCurso.modalidade}</span>}
                {info.observacoesCurso.horario && <span>{info.observacoesCurso.horario}</span>}
              </div>
            </div>

            <div className="mb-3">
              <div className="text-muted small">Preço base do curso</div>
              <div className="fw-bold">{info.precoBaseFmt}</div>
              {info.observacoesCurso.obsPrice && (
                <div className="text-muted small mt-1">{info.observacoesCurso.obsPrice}</div>
              )}
            </div>

            <Row className="g-3">
              <Col md={6}>
                <Card bg="light" className="h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-2">
                      <FaQrcode className="me-2" /> <strong>PIX</strong>
                      {info.pix.descontoExtraAplicado > 0 && <Badge bg="success" className="ms-2">Desconto</Badge>}
                    </div>
                    <div className="mb-1"><span className="fw-bold">{info.pix.valorFmt}</span></div>
                    {info.pix.descontoExtraAplicado > 0 && (
                      <div className="text-muted small mb-2">Desconto aplicado: {info.pix.descontoExtraAplicadoFmt}</div>
                    )}
                    <div className="text-muted" style={{ whiteSpace: "pre-wrap" }}>{info.pix.mensagem}</div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card bg="light" className="h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-2">
                      <FaCreditCard className="me-2" /> <strong>Cartão de Crédito</strong>
                    </div>
                    <div className="mb-1"><span className="fw-bold">{info.cartao.valorFmt}</span></div>
                    <div className="text-muted small mb-2">
                      até {info.cartao.ate12x.parcelas}x de {info.cartao.ate12x.valorParcelaFmt}
                    </div>
                    <div className="text-muted" style={{ whiteSpace: "pre-wrap" }}>{info.cartao.mensagem}</div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {info.mensalidades.disponivel && (
              <Card bg="white" className="mt-3 border">
                <Card.Body>
                  <div className="d-flex align-items-center mb-2">
                    <BsFileEarmarkText className="me-2" /> <strong>{info.mensalidades.parcelas} Mensalidades</strong>
                    <Badge bg="secondary" className="ms-2">Pix/Boleto</Badge>
                  </div>
                  <div className="mb-1">
                    Valor da parcela: <span className="fw-bold">{info.mensalidades.valorParcelaFmt}</span>
                  </div>
                  <div className="text-muted" style={{ whiteSpace: "pre-wrap" }}>
                    {info.mensalidades.mensagem}
                  </div>
                </Card.Body>
              </Card>
            )}
          </Card.Body>
        </Card>
      )}

      <Card className="shadow-sm mb-4 bg-body">
        <Card.Body>
          <Card.Title className="mb-3">Escolha a forma de pagamento</Card.Title>

          <Row className="g-3">
            <Col xs={12} md={6}>
              <BigActionButton
                variant="success"
                loading={loading === "PIX"}
                icon={<FaQrcode size={20} />}
                title={info?.pix?.valorFmt ? `Pagar com PIX (${info.pix.valorFmt})` : "Pagar com PIX"}
                subtitle="à vista"
                onClick={() => handlePayment("PIX")}
                disabled={!!loading}
              />
            </Col>

            <Col xs={12} md={6}>
              <BigActionButton
                variant="primary"
                loading={loading === "CARTAO"}
                icon={<FaCreditCard size={20} />}
                title={info?.cartao?.valorFmt ? `Cartão de Crédito (${info.cartao.valorFmt})` : "Cartão de Crédito"}
                subtitle={info?.cartao?.ate12x?.valorParcelaFmt
                  ? `até 12× de ${info.cartao.ate12x.valorParcelaFmt}`
                  : "até 12×"}
                onClick={() => handlePayment("CARTAO")}
                disabled={!!loading}
              />
            </Col>

            {info?.mensalidades?.disponivel && (
              <Col xs={12}>
                <BigActionButton
                  variant="outline-secondary"
                  loading={loading === "ASSINATURA"}
                  icon={<BsFileEarmarkText size={20} />}
                  title={
                    assinaturaJaSolicitada
                      ? "Pagamento em mensalidades já solicitado"
                      : `Solicitar ${info.mensalidades.parcelas} mensalidades de ${info.mensalidades.valorParcelaFmt}`
                  }
                  subtitle={assinaturaJaSolicitada ? "aguarde nosso contato" : "pix/boleto"}
                  onClick={assinaturaJaSolicitada ? undefined : openAssinaturaModal}
                  disabled={!!loading || assinaturaJaSolicitada}
                />
                {assinaturaJaSolicitada && (
                  <div className="text-muted small mt-2">
                    Já recebemos sua solicitação. Nossa equipe entrará em contato por e-mail e WhatsApp.
                  </div>
                )}
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          <Card.Text className="mb-1">
            Dúvidas sobre o pagamento? Fale conosco no WhatsApp:
          </Card.Text>
          <a
            className="btn btn-outline-success"
            href={`https://wa.me/5583986608771?text=${encodeURIComponent(
              `Olá! Tenho dúvidas sobre o pagamento da minha inscrição #${validInscricaoId}.`
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            Abrir WhatsApp
          </a>
        </Card.Body>
      </Card>

      {/* Modal de confirmação da assinatura */}
      <Modal show={showConfirmAssinatura} onHide={closeAssinaturaModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Solicitar pagamento em mensalidades</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Nossa equipe vai <strong>analisar sua solicitação</strong> e entraremos em contato por
            <strong> e-mail</strong> e <strong>WhatsApp</strong>.
          </p>
          <p>
            Quando <strong>aprovado</strong>, você receberá do Asaas o e-mail com a
            <strong> 1ª mensalidade</strong> para pagamento.
          </p>
          <p className="mb-0">Deseja enviar a solicitação agora?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeAssinaturaModal}>Cancelar</Button>
          <Button variant="primary" onClick={confirmAssinatura} disabled={loading === "ASSINATURA"}>
            {loading === "ASSINATURA" ? <Spinner animation="border" size="sm" className="me-2" /> : null}
            Enviar solicitação
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de sucesso da assinatura */}
      <Modal show={showDoneAssinatura} onHide={closeDoneModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Solicitação recebida ✅</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Obrigado! Registramos sua solicitação de pagamento em mensalidades.</p>
          <ul>
            <li>Analizaremos seu pedido e entraremos em contato por e-mail e WhatsApp.</li>
            <li>Quando aprovado, o Asaas enviará a 1ª cobrança para pagamento.</li>
          </ul>
          <p className="mb-0">Você será redirecionado para a página inicial ao fechar este aviso.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={closeDoneModal}>Fechar</Button>
        </Modal.Footer>
      </Modal>
    </Container>
    </div>
  )
}

export default Pagamento
