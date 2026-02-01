import React, { useMemo } from "react"
import { Modal, Table, Button } from "react-bootstrap"

interface ParcelamentoModalProps {
  show: boolean
  onHide: () => void
  valor: number
}

const ParcelamentoModal: React.FC<ParcelamentoModalProps> = ({
  show,
  onHide,
  valor
}) => {
  // Calcula as parcelas dinamicamente
  const parcelas = useMemo(() => {
    if (!valor || valor <= 0) return []

    // Valor com 8% de acréscimo para parcelamento
    const valorComAcrescimo = valor * 1.08

    // Gera opções de 1x até 12x
    const opcoes = []
    for (let i = 1; i <= 12; i++) {
      const valorParcela = valorComAcrescimo / i
      opcoes.push({
        vezes: i,
        valorParcela: `R$ ${valorParcela.toFixed(2).replace(".", ",")}`,
        total: `R$ ${valorComAcrescimo.toFixed(2).replace(".", ",")}`
      })
    }
    return opcoes
  }, [valor])

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Opções de Parcelamento no Cartão de Crédito</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {parcelas.length === 0 ? (
          <p className="text-muted">Ainda não há simulações disponíveis para este valor.</p>
        ) : (
          <>
            <div className="mb-3 p-3 bg-light rounded">
              <p className="mb-2">
                <strong>Valor à vista (PIX):</strong>{" "}
                <span className="text-success fw-bold">R$ {valor.toFixed(2).replace(".", ",")}</span>
              </p>
              <p className="mb-0 text-muted small">
                💳 Parcelamento no cartão: em até 12x
              </p>
            </div>

            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Parcelas</th>
                  <th>Valor de cada parcela</th>
                  <th>Total final</th>
                </tr>
              </thead>
              <tbody>
                {parcelas.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.vezes}x</td>
                    <td className="fw-bold">{p.valorParcela}</td>
                    <td>{p.total}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <p className="text-muted small mt-3">
              💳 <strong>Importante:</strong> Os valores apresentados são uma simulação e podem sofrer alterações conforme as taxas do emissor do cartão.
            </p>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ParcelamentoModal
