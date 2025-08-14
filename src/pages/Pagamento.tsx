// src/pages/Pagamento.tsx

import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Container, Row, Col, Button, Alert, Spinner, Card, Placeholder, Badge } from "react-bootstrap"
import axios from "axios"
import { FaQrcode, FaCreditCard } from "react-icons/fa"
import { BsFileEarmarkText } from "react-icons/bs"

type LoadingKind = "PIX" | "CARTAO" | "ASSINATURA" | null

// Tipos do payload retornado por /pagamento-info
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
  observacoesCurso: {
    obsPrice: string
    modalidade: string
    horario: string
  }
}

const Pagamento: React.FC = () => {
  const { inscricaoId } = useParams<{ inscricaoId?: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState<LoadingKind>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Estado com informações do endpoint /pagamento-info
  const [info, setInfo] = useState<PagamentoInfo | null>(null)
  const [loadingInfo, setLoadingInfo] = useState<boolean>(true)

  if (!inscricaoId) {
    navigate("/")
    return null
  }

  // Carrega dados de pagamento (valores + textos de marketing)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoadingInfo(true)
      setError(null)
      try {
        const resp = await axios.get<PagamentoInfo>(
          `${import.meta.env.VITE_API_URL}/pagamento-info`,
          { params: { inscricaoId } }
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
  }, [inscricaoId])

  // Gera link do Asaas (PIX ou CARTÃO)
  const handlePayment = async (method: "PIX" | "CARTAO") => {
    setError(null)
    setSuccessMsg(null)
    setLoading(method)
    try {
      const resp = await axios.post<{ url: string }>(
        `${import.meta.env.VITE_API_URL}/paymentlink`,
        { inscricaoId, paymentMethod: method }
      )
      window.location.href = resp.data.url
    } catch (err) {
      console.error("Erro ao gerar link de pagamento", err)
      setError("Não foi possível gerar o link de pagamento. Tente novamente.")
      setLoading(null)
    }
  }

  // Solicita assinatura (6x de R$250 via pix/boleto) – aparece apenas quando a API indica que está disponível
  const handleAssinatura = async () => {
    setError(null)
    setSuccessMsg(null)
    setLoading("ASSINATURA")
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/isAssinatura`, {
        inscricaoId,
        isAssinatura: true
      })
      setSuccessMsg("Solicitação de assinatura enviada! Em breve entraremos em contato com os próximos passos.")
      setLoading(null)
    } catch (err) {
      console.error("Erro ao solicitar assinatura", err)
      setError("Não foi possível registrar sua solicitação de assinatura. Tente novamente.")
      setLoading(null)
    }
  }

  // UI de carregamento dos cards de preço (skeleton simples)
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

  return (
    <Container className="py-5" style={{ maxWidth: 820 }}>
      {/* Mensagem clara e amigável no topo */}
      <Alert variant="info" className="mb-4">
        <strong>Sua inscrição foi recebida</strong>, mas <strong>só será confirmada após a confirmação do pagamento</strong>.{" "}
        Após a confirmação, entraremos em contato com mais informações sobre o seu curso. 🚀
      </Alert>

      <h2 className="text-center mb-2">Pagamento da Inscrição</h2>
      <p className="text-center text-muted mb-4">
        <small>ID da inscrição: <strong>#{inscricaoId}</strong></small>
      </p>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      {successMsg && <Alert variant="success" className="mb-4">{successMsg}</Alert>}

      {/* Bloco com detalhes do curso e preços/marketing */}
      {loadingInfo && <PriceSkeleton />}
      {!loadingInfo && info && (
        <Card className="shadow-sm mb-4">
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

            {/* Preço base */}
            <div className="mb-3">
              <div className="text-muted small">Preço base do curso</div>
              <div className="fw-bold">{info.precoBaseFmt}</div>
              {info.observacoesCurso.obsPrice && (
                <div className="text-muted small mt-1">{info.observacoesCurso.obsPrice}</div>
              )}
            </div>

            {/* Mensagens de marketing e valores */}
            <Row className="g-3">
              <Col md={6}>
                <Card bg="light" className="h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-2">
                      <FaQrcode className="me-2" /> <strong>PIX</strong>
                      {info.pix.descontoExtraAplicado > 0 && (
                        <Badge bg="success" className="ms-2">Desconto</Badge>
                      )}
                    </div>
                    <div className="mb-1"><span className="fw-bold">{info.pix.valorFmt}</span></div>
                    {info.pix.descontoExtraAplicado > 0 && (
                      <div className="text-muted small mb-2">
                        Desconto aplicado: {info.pix.descontoExtraAplicadoFmt}
                      </div>
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

            {/* Plano de 6 mensalidades (apenas quando disponível) */}
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

      {/* Ações de pagamento */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title className="mb-3">Escolha a forma de pagamento</Card.Title>

          <Row className="g-3">
            <Col xs={12} md={6}>
              {/* PIX */}
              <Button
                variant="success"
                size="lg"
                className="w-100 d-flex align-items-center justify-content-center"
                onClick={() => handlePayment("PIX")}
                disabled={!!loading}
              >
                {loading === "PIX" ? (
                  <Spinner animation="border" size="sm" className="me-2" />
                ) : (
                  <FaQrcode className="me-2" />
                )}
                {info?.pix?.valorFmt ? `Pagar com PIX (${info.pix.valorFmt})` : "Pagar com PIX"}
              </Button>
            </Col>

            <Col xs={12} md={6}>
              {/* CARTÃO */}
              <Button
                variant="primary"
                size="lg"
                className="w-100 d-flex flex-column align-items-center justify-content-center"
                onClick={() => handlePayment("CARTAO")}
                disabled={!!loading}
                style={{ lineHeight: 1.1 }}
              >
                {loading === "CARTAO" ? (
                  <Spinner animation="border" size="sm" className="mb-1" />
                ) : (
                  <FaCreditCard className="mb-1" size={20} />
                )}
                {info?.cartao?.valorFmt ? `Cartão de Crédito (${info.cartao.valorFmt})` : "Cartão de Crédito"}
                <small className="d-block" style={{ fontSize: "0.8em" }}>
                  {info?.cartao?.ate12x?.valorParcelaFmt
                    ? `até 12× de ${info.cartao.ate12x.valorParcelaFmt}`
                    : "até 12×"}
                </small>
              </Button>
            </Col>

            {/* ASSINATURA (exibido apenas quando o endpoint sinaliza disponibilidade) */}
            {info?.mensalidades?.disponivel && (
              <Col xs={12}>
                <Button
                  variant="outline-secondary"
                  size="lg"
                  className="w-100 d-flex flex-column align-items-center justify-content-center"
                  onClick={handleAssinatura}
                  disabled={!!loading}
                >
                  {loading === "ASSINATURA" ? (
                    <Spinner animation="border" size="sm" className="mb-1" />
                  ) : (
                    <BsFileEarmarkText className="mb-1" size={20} />
                  )}
                  Solicitar {info.mensalidades.parcelas} mensalidades de {info.mensalidades.valorParcelaFmt} (pix/boleto)
                  <small className="d-block text-muted" style={{ fontSize: "0.8em" }}>
                    registraremos sua solicitação e enviaremos as instruções
                  </small>
                </Button>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>

      {/* Dica/Contato */}
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Text className="mb-1">
            Dúvidas sobre o pagamento? Fale conosco no WhatsApp:
          </Card.Text>
          <a
            className="btn btn-outline-success"
            href={`https://wa.me/5583986608771?text=${encodeURIComponent(
              `Olá! Tenho dúvidas sobre o pagamento da minha inscrição #${inscricaoId}.`
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            Abrir WhatsApp
          </a>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default Pagamento
