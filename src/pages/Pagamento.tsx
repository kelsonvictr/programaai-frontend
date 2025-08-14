// src/pages/Pagamento.tsx

import React, { useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Container, Row, Col, Button, Alert, Spinner, Card } from "react-bootstrap"
import axios from "axios"
import { FaQrcode, FaCreditCard } from "react-icons/fa"
import { BsFileEarmarkText } from "react-icons/bs"

type LoadingKind = "PIX" | "CARTAO" | "ASSINATURA" | null

const Pagamento: React.FC = () => {
  const { inscricaoId } = useParams<{ inscricaoId?: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState<LoadingKind>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Mostra botão de assinatura apenas se ?isFullstack=true
  const showAssinatura = (searchParams.get("isFullstack") || "").toLowerCase() === "true"

  if (!inscricaoId) {
    navigate("/")
    return null
  }

  // Gera link do Asaas (PIX ou CARTÃO)
  const handlePayment = async (method: "PIX" | "CARTAO") => {
    setError(null)
    setSuccessMsg(null)
    setLoading(method)
    try {
      const resp = await axios.post<{ url: string }>(
        `${import.meta.env.VITE_API_URL}/paymentlink`,
        {
          inscricaoId,
          paymentMethod: method
        }
      )
      window.location.href = resp.data.url
    } catch (err) {
      console.error("Erro ao gerar link de pagamento", err)
      setError("Não foi possível gerar o link de pagamento. Tente novamente.")
      setLoading(null)
    }
  }

  // Solicita assinatura (6x de R$250 via pix/boleto) – apenas Fullstack
  const handleAssinatura = async () => {
    setError(null)
    setSuccessMsg(null)
    setLoading("ASSINATURA")
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/isAssinatura`,
        {
          inscricaoId,
          isAssinatura: true // grava booleano na inscrição
        }
      )
      setSuccessMsg("Solicitação de assinatura enviada! Em breve entraremos em contato com os próximos passos.")
      setLoading(null)
    } catch (err) {
      console.error("Erro ao solicitar assinatura", err)
      setError("Não foi possível registrar sua solicitação de assinatura. Tente novamente.")
      setLoading(null)
    }
  }

  return (
    <Container className="py-5" style={{ maxWidth: 720 }}>
      {/* Mensagem clara e amigável no topo */}
      <Alert variant="info" className="mb-4">
        <strong>Sua inscrição foi recebida</strong>, mas <strong>só será confirmada após a confirmação do pagamento</strong>.{" "}
        Após a confirmação, entraremos em contato com mais informações sobre o seu curso. 🚀
      </Alert>

      <h2 className="text-center mb-2">
        Pagamento da Inscrição
      </h2>
      <p className="text-center text-muted mb-4">
        <small>ID da inscrição: <strong>#{inscricaoId}</strong></small>
      </p>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      {successMsg && <Alert variant="success" className="mb-4">{successMsg}</Alert>}

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
                Pagar com PIX
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
                Cartão de Crédito
                <small className="d-block" style={{ fontSize: "0.8em" }}>
                  até 12×
                </small>
              </Button>
            </Col>

            {showAssinatura && (
              <Col xs={12}>
                {/* ASSINATURA (somente Fullstack via query param) */}
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
                  Solicitar 6 mensalidades de R$250,00 (pix/boleto)
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
