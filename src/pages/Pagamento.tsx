// src/pages/Pagamento.tsx

import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Container, Row, Col, Button, Alert, Spinner } from "react-bootstrap"
import axios from "axios"
import { FaQrcode, FaCreditCard } from "react-icons/fa"

const Pagamento: React.FC = () => {
  const { inscricaoId } = useParams<{ inscricaoId?: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState<"PIX" | "CARTAO" | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!inscricaoId) {
    navigate("/")
    return null
  }

  const handlePayment = async (method: "PIX" | "CARTAO") => {
    setError(null)
    setLoading(method)
    try {
      const resp = await axios.post<{ url: string }>(
        `${import.meta.env.VITE_API_URL}/paymentlink`,
        {
          inscricaoId,
          paymentMethod: method,
        }
      )
      window.location.href = resp.data.url
    } catch (err) {
      console.error("Erro ao gerar link de pagamento", err)
      setError("Não foi possível gerar o link de pagamento. Tente novamente.")
      setLoading(null)
    }
  }

  return (
    <Container className="py-5" style={{ maxWidth: 600 }}>
      <h2 className="text-center mb-4">
        Pagamento da Inscrição <br/>
        <small className="text-muted">#{inscricaoId}</small>
      </h2>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <Row className="g-3">
        <Col xs={12} md={6}>
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
            PIX
          </Button>
        </Col>

        <Col xs={12} md={6}>
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
            CARTÃO
            <small className="d-block" style={{ fontSize: "0.8em" }}>
              (até 12×)
            </small>
          </Button>
        </Col>
      </Row>
    </Container>
  )
}

export default Pagamento
