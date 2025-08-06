// src/pages/Pagamento.tsx

import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Container, Button, Alert, Spinner } from "react-bootstrap"
import axios from "axios"

const Pagamento: React.FC = () => {
  const { inscricaoId } = useParams<{ inscricaoId?: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // se não vier o parâmetro, volta pra home
  if (!inscricaoId) {
    navigate("/")
    return null
  }

  const handlePayment = async (method: "PIX" | "CARTAO") => {
    setError(null)
    setLoading(true)
    try {
      const resp = await axios.post<{ url: string }>(
        `${import.meta.env.VITE_API_URL}/paymentlink`,
        {
          inscricaoId,
          paymentMethod: method,
        }
      )
      // redireciona pro ASAAS
      window.location.href = resp.data.url
    } catch (err) {
      console.error("Erro ao gerar link de pagamento", err)
      setError("Não foi possível gerar o link de pagamento. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <Container className="py-5 text-center">
      <h2 className="mb-4">Pagamento da Inscrição #{inscricaoId}</h2>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <div className="d-flex flex-column align-items-center gap-3">
        <Button
          variant="success"
          size="lg"
          onClick={() => handlePayment("PIX")}
          disabled={loading}
        >
          {loading ? <Spinner animation="border" size="sm" /> : "PIX"}{" "}
          Prossiga para pagar com PIX
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={() => handlePayment("CARTAO")}
          disabled={loading}
        >
          {loading ? <Spinner animation="border" size="sm" /> : "CARTÃO"}{" "}
          Prossiga para pagar com CARTÃO (até 12x)
        </Button>
      </div>
    </Container>
  )
}

export default Pagamento
