import React from "react"
import { Modal, Table, Button } from "react-bootstrap"
import type { Parcelamento } from "../mocks/parcelamentos"
import { parcelamentos19999 } from "../mocks/parcelamentos"

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
  let parcelas: Parcelamento[] = []

  if (valor === 199.99) {
    parcelas = parcelamentos19999
  } else {
    parcelas = []
    // Você poderá adicionar outros valores futuramente com base no valor
  }

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Opções de Parcelamento no Cartão de Crédito</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {parcelas.length === 0 ? (
          <p className="text-muted">Ainda não há simulações disponíveis para este valor.</p>
        ) : (
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
                  <td>{p.valorParcela}</td>
                  <td>{p.total}</td>
                </tr>
              ))}
            </tbody>
          </Table>
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
