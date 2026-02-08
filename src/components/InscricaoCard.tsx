import React from 'react'
import { Badge, Button, Form, InputGroup, Spinner } from 'react-bootstrap'
import { Check2, FileEarmarkPdf, Whatsapp } from 'react-bootstrap-icons'

type MonthlyPaymentStatus = 'ok' | 'late'

type MonthlyPaymentSlot = {
  index: number
  amount?: number | null
  status?: MonthlyPaymentStatus | null
}

type PaymentMode = 'one-time' | 'monthly'

type Inscricao = {
  id: string
  nomeCompleto: string
  email: string
  curso: string
  dataInscricao: string
  whatsapp?: string
  ondeEstuda?: string
  asaasPaymentLinkUrl?: string
  asaasPaymentStatus?: string | null
  asaasPaymentUpdatedAt?: string | null
  asaasPaymentBillingType?: string | null
  asaasPaymentValue?: number | null
  valorOriginal?: number
  valorCurso?: number
  cupom?: string | null
  pago?: boolean | null
  grupoWhatsapp?: boolean | null
  remoto?: boolean | null
  valorLiquidoFinal?: number | null
  observacoes?: string | null
  paymentMode?: PaymentMode | null
  monthlyPayments?: MonthlyPaymentSlot[] | null
  valorPrevisto?: number | null
  
  // Clicksign
  clicksignDocumentKey?: string | null
  clicksignStatus?: string | null
  clicksignSentAt?: string | null
}

type EditableField =
  | 'valorLiquidoFinal'
  | 'observacoes'
  | 'paymentMode'
  | 'monthlyPayments'
  | 'valorPrevisto'

interface InscricaoCardProps {
  inscricao: Inscricao
  curso: string
  busy: Record<string, boolean>
  copiedPaymentId: string | null
  money: (value: number) => string
  buildWhatsappUrl: (phone?: string) => string | null
  isFullstackCourse: (curso?: string) => boolean
  getPaymentMode: (i: Inscricao) => PaymentMode
  ensureMonthlyPayments: (payments?: MonthlyPaymentSlot[] | null) => MonthlyPaymentSlot[]
  sumMonthlyPayments: (payments: MonthlyPaymentSlot[]) => number
  formatDateTime: (date?: string | null) => string
  keyBusy: (id: string, field: string) => string
  toggleField: (id: string, currentValue: boolean | null | undefined, field: 'pago' | 'grupoWhatsapp' | 'remoto') => Promise<void>
  setLocalField: <K extends keyof Inscricao>(id: string, field: K, value: Inscricao[K]) => void
  getLocalFieldValue: <K extends EditableField>(id: string, field: K) => Inscricao[K] | null
  updateField: <K extends EditableField>(id: string, field: K, value: Inscricao[K]) => Promise<void>
  handlePaymentModeChange: (i: Inscricao, mode: PaymentMode) => void
  handleMonthlyStatusChange: (i: Inscricao, index: number, status: MonthlyPaymentStatus) => void
  handleMonthlyAmountChange: (i: Inscricao, index: number, value: string) => void
  handleValorPrevistoChange: (i: Inscricao, value: string) => void
  handleMonthlySave: (i: Inscricao) => Promise<void>
  gerarContrato: (id: string) => void
  enviarClicksign: (id: string) => void
  copyPaymentLink: (id: string) => void
  openAgendamentoModal: (i: Inscricao) => void
  deletar: (id: string) => void
  recomputeAggregates: () => void
  ASAAS_STATUS_LABELS: Record<string, string>
  ASAAS_STATUS_VARIANTS: Record<string, string>
}

const InscricaoCard: React.FC<InscricaoCardProps> = ({
  inscricao: i,
  curso,
  busy,
  copiedPaymentId,
  money,
  buildWhatsappUrl,
  isFullstackCourse,
  getPaymentMode,
  ensureMonthlyPayments,
  sumMonthlyPayments,
  formatDateTime,
  keyBusy,
  toggleField,
  setLocalField,
  getLocalFieldValue,
  updateField,
  handlePaymentModeChange,
  handleMonthlyStatusChange,
  handleMonthlyAmountChange,
  handleValorPrevistoChange,
  handleMonthlySave,
  gerarContrato,
  enviarClicksign,
  copyPaymentLink,
  openAgendamentoModal,
  deletar,
  recomputeAggregates,
  ASAAS_STATUS_LABELS,
  ASAAS_STATUS_VARIANTS
}) => {
  const pagoKey = keyBusy(i.id, 'pago')
  const grupoKey = keyBusy(i.id, 'grupoWhatsapp')
  const remotoKey = keyBusy(i.id, 'remoto')
  const vlKey = keyBusy(i.id, 'valorLiquidoFinal')
  const obsKey = keyBusy(i.id, 'observacoes')
  const contratoKey = keyBusy(i.id, 'contrato')
  const clicksignKey = keyBusy(i.id, 'clicksign')
  const paymentModeBusyKey = keyBusy(i.id, 'paymentMode')
  const monthlyBusy = [
    keyBusy(i.id, 'monthlyPayments'),
    keyBusy(i.id, 'valorPrevisto'),
    paymentModeBusyKey,
    vlKey
  ].some(key => busy[key])

  const pagoChecked = !!i.pago
  const grupoChecked = !!i.grupoWhatsapp
  const remotoChecked = !!i.remoto

  const vl = typeof i.valorLiquidoFinal === 'number' ? i.valorLiquidoFinal : null
  const valorPrevisto = typeof i.valorPrevisto === 'number' ? i.valorPrevisto : null
  const obs = i.observacoes ?? ''
  const whatsappUrl = buildWhatsappUrl(i.whatsapp)
  const isFullstack = isFullstackCourse(i.curso || curso)
  const paymentMode = getPaymentMode(i)
  const normalizedMonthlyPayments = ensureMonthlyPayments(i.monthlyPayments)
  const showMonthlyDetails = isFullstack && paymentMode === 'monthly'
  const monthlyTotal = sumMonthlyPayments(normalizedMonthlyPayments)
  const asaasStatusRaw = (i.asaasPaymentStatus || '').toUpperCase()
  const asaasStatusLabel = asaasStatusRaw
    ? (ASAAS_STATUS_LABELS[asaasStatusRaw] || asaasStatusRaw)
    : ''
  const asaasStatusVariant = (asaasStatusRaw && ASAAS_STATUS_VARIANTS[asaasStatusRaw])
    ? ASAAS_STATUS_VARIANTS[asaasStatusRaw]
    : 'secondary'

  return (
    <div className="galaxy-inscription-card">
      {/* Header */}
      <div className="galaxy-card-header">
        <div className="galaxy-card-user-info">
          <div className="galaxy-card-user-name">{i.nomeCompleto}</div>
          <div className="galaxy-card-user-date">
            🗓️ {new Date(i.dataInscricao).toLocaleString('pt-BR')}
          </div>
        </div>
        <div className="galaxy-card-badges">
          {pagoChecked ? (
            <span className="galaxy-card-badge pago">✓ Pago</span>
          ) : (
            <span className="galaxy-card-badge pendente">⏱ Pendente</span>
          )}
          {grupoChecked && <span className="galaxy-card-badge grupo">💬 Grupo</span>}
          {remotoChecked ? (
            <span className="galaxy-card-badge remoto">💻 Remoto</span>
          ) : (
            <span className="galaxy-card-badge presencial">🏢 Presencial</span>
          )}
          
          {/* Badge Clicksign */}
          {i.clicksignStatus && (
            <span 
              className="galaxy-card-badge"
              style={{
                background: i.clicksignStatus === 'signed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(250, 204, 21, 0.2)',
                borderColor: i.clicksignStatus === 'signed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(250, 204, 21, 0.3)',
                color: i.clicksignStatus === 'signed' ? 'rgb(16, 185, 129)' : 'rgb(250, 204, 21)'
              }}
              title={i.clicksignSentAt ? `Enviado em: ${new Date(i.clicksignSentAt).toLocaleString('pt-BR')}` : undefined}
            >
              ✍️ {i.clicksignStatus === 'signed' ? 'Assinado' : 'Pendente'}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="galaxy-card-body">
        {/* Email */}
        <div className="galaxy-card-field">
          <div className="galaxy-card-field-label">📧 Email</div>
          <div className="galaxy-card-field-value email">{i.email}</div>
        </div>

        {/* WhatsApp */}
        <div className="galaxy-card-field">
          <div className="galaxy-card-field-label">📱 WhatsApp</div>
          <div className="galaxy-card-field-value phone">
            <span>{i.whatsapp || '-'}</span>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="galaxy-card-whatsapp-btn"
              >
                <Whatsapp /> Abrir
              </a>
            )}
          </div>
        </div>

        {/* Valor do Curso */}
        <div className="galaxy-card-field">
          <div className="galaxy-card-field-label">💰 Valor do Curso</div>
          <div className="galaxy-card-field-value value">{money(i.valorCurso || 0)}</div>
        </div>

        {/* Seção de Pagamento */}
        <div className="galaxy-card-payment-section">
          <div className="galaxy-card-payment-header">
            <span className="galaxy-card-payment-title">💳 Pagamento</span>
            {asaasStatusLabel && (
              <Badge bg={asaasStatusVariant} style={{ fontSize: '0.7rem' }}>
                {asaasStatusLabel}
              </Badge>
            )}
          </div>

          {isFullstack ? (
            <>
              <div className="galaxy-card-payment-mode">
                <Form.Check
                  type="radio"
                  id={`pagamento-unico-${i.id}`}
                  label="Pagamento único"
                  name={`payment-mode-${i.id}`}
                  checked={paymentMode === 'one-time'}
                  onChange={() => handlePaymentModeChange(i, 'one-time')}
                  style={{ fontSize: '0.85rem' }}
                />
                <Form.Check
                  type="radio"
                  id={`pagamento-mensal-${i.id}`}
                  label="Mensalidades (6x)"
                  name={`payment-mode-${i.id}`}
                  checked={paymentMode === 'monthly'}
                  onChange={() => handlePaymentModeChange(i, 'monthly')}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              {showMonthlyDetails && (
                <>
                  <div className="galaxy-card-monthly-grid">
                    {normalizedMonthlyPayments.map(slot => (
                      <div key={slot.index} className="galaxy-card-monthly-slot">
                        <div className="galaxy-card-monthly-slot-header">
                          <span className="galaxy-card-monthly-slot-title">
                            Mensalidade {slot.index + 1}
                          </span>
                          <div className="galaxy-card-monthly-status-btns">
                            <button
                              type="button"
                              className={`galaxy-card-status-btn ok ${
                                slot.status === 'ok' ? 'active' : ''
                              }`}
                              onClick={() => handleMonthlyStatusChange(i, slot.index, 'ok')}
                              title="Em dia"
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              className={`galaxy-card-status-btn late ${
                                slot.status === 'late' ? 'active' : ''
                              }`}
                              onClick={() => handleMonthlyStatusChange(i, slot.index, 'late')}
                              title="Em atraso"
                            >
                              !
                            </button>
                          </div>
                        </div>
                        <Form.Control
                          size="sm"
                          type="number"
                          min={0}
                          step="0.01"
                          value={slot.amount ?? ''}
                          placeholder="R$ 0,00"
                          onChange={e => handleMonthlyAmountChange(i, slot.index, e.target.value)}
                          style={{
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            color: 'var(--galaxy-text-primary)',
                            fontSize: '0.85rem'
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <Form.Label style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                      Valor previsto
                    </Form.Label>
                    <InputGroup size="sm">
                      <InputGroup.Text>R$</InputGroup.Text>
                      <Form.Control
                        type="number"
                        min={0}
                        step="0.01"
                        value={valorPrevisto ?? ''}
                        onChange={e => handleValorPrevistoChange(i, e.target.value)}
                        style={{
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          color: 'var(--galaxy-text-primary)'
                        }}
                      />
                    </InputGroup>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--galaxy-text-subtle)', marginBottom: '0.5rem' }}>
                    Recebido até agora: <strong style={{ color: 'var(--galaxy-accent-green)' }}>{money(monthlyTotal)}</strong>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => void handleMonthlySave(i)}
                    disabled={monthlyBusy}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    {monthlyBusy ? <Spinner size="sm" animation="border" /> : 'Salvar pagamentos'}
                  </Button>
                </>
              )}

              {!showMonthlyDetails && (
                <div style={{ fontSize: '0.8rem', color: 'var(--galaxy-text-subtle)' }}>
                  Controle padrão de pagamento único
                </div>
              )}

              {i.asaasPaymentUpdatedAt && (
                <div style={{ fontSize: '0.75rem', color: 'var(--galaxy-text-subtle)', marginTop: '0.5rem' }}>
                  Atualizado: {formatDateTime(i.asaasPaymentUpdatedAt)}
                </div>
              )}
            </>
          ) : (
            <>
              <Badge bg="secondary" pill style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                Pagamento único
              </Badge>
              {asaasStatusLabel && i.asaasPaymentUpdatedAt && (
                <div style={{ fontSize: '0.75rem', color: 'var(--galaxy-text-subtle)', marginTop: '0.5rem' }}>
                  Atualizado: {formatDateTime(i.asaasPaymentUpdatedAt)}
                </div>
              )}
            </>
          )}
        </div>

        {/* Valor Líquido Final */}
        {!showMonthlyDetails && (
          <div className="galaxy-card-field">
            <div className="galaxy-card-field-label">💵 Valor Líquido Final</div>
            <InputGroup size="sm">
              <InputGroup.Text>R$</InputGroup.Text>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                value={vl ?? ''}
                placeholder="0,00"
                disabled={!!busy[vlKey]}
                onChange={e => {
                  const raw = e.target.value
                  const numericValue = raw === '' ? null : Number(raw)
                  const safeValue =
                    typeof numericValue === 'number' && Number.isNaN(numericValue)
                      ? null
                      : numericValue
                  setLocalField(i.id, 'valorLiquidoFinal', safeValue)
                  recomputeAggregates()
                }}
                onBlur={e => {
                  const raw = e.target.value
                  const numericValue = raw === '' ? null : Number(raw)
                  const safeValue =
                    typeof numericValue === 'number' && Number.isNaN(numericValue)
                      ? null
                      : numericValue
                  updateField(i.id, 'valorLiquidoFinal', safeValue)
                }}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  color: 'var(--galaxy-text-primary)'
                }}
              />
              <Button
                variant="outline-secondary"
                size="sm"
                disabled={!!busy[vlKey]}
                onClick={() =>
                  updateField(i.id, 'valorLiquidoFinal', getLocalFieldValue(i.id, 'valorLiquidoFinal'))
                }
                title="Salvar valor"
              >
                <Check2 />
              </Button>
              {busy[vlKey] && (
                <InputGroup.Text>
                  <Spinner size="sm" animation="border" />
                </InputGroup.Text>
              )}
            </InputGroup>
          </div>
        )}

        {/* Observações */}
        <div className="galaxy-card-obs-field">
          <div className="galaxy-card-field-label">📝 Observações</div>
          <textarea
            className="galaxy-card-obs-input"
            value={obs}
            placeholder="Anotações internas…"
            disabled={!!busy[obsKey]}
            onChange={e => setLocalField(i.id, 'observacoes', e.target.value)}
            onBlur={e => updateField(i.id, 'observacoes', e.target.value || null)}
          />
        </div>

        {/* Toggles */}
        <div className="galaxy-card-toggles">
          <div className="galaxy-card-toggle">
            <Form.Check
              type="switch"
              id={`pago-${i.id}`}
              checked={pagoChecked}
              disabled={!!busy[pagoKey]}
              onChange={() => toggleField(i.id, i.pago, 'pago')}
            />
            <span className="galaxy-card-toggle-label">Pago</span>
            {busy[pagoKey] && <Spinner size="sm" animation="border" />}
          </div>

          <div className="galaxy-card-toggle">
            <Form.Check
              type="switch"
              id={`grupo-${i.id}`}
              checked={grupoChecked}
              disabled={!!busy[grupoKey]}
              onChange={() => toggleField(i.id, i.grupoWhatsapp, 'grupoWhatsapp')}
            />
            <span className="galaxy-card-toggle-label">Grupo WhatsApp</span>
            {busy[grupoKey] && <Spinner size="sm" animation="border" />}
          </div>

          <div className="galaxy-card-toggle">
            <Form.Check
              type="switch"
              id={`remoto-${i.id}`}
              checked={remotoChecked}
              disabled={!!busy[remotoKey]}
              onChange={() => toggleField(i.id, i.remoto, 'remoto')}
            />
            <span className="galaxy-card-toggle-label">Remoto</span>
            {busy[remotoKey] && <Spinner size="sm" animation="border" />}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="galaxy-card-footer">
        <button
          className="galaxy-card-btn galaxy-card-btn-primary"
          disabled={!!busy[contratoKey]}
          onClick={() => gerarContrato(i.id)}
          title="Gerar contrato PDF"
        >
          {busy[contratoKey] ? <Spinner size="sm" animation="border" /> : <><FileEarmarkPdf /> Contrato</>}
        </button>

        <button
          className="galaxy-card-btn galaxy-card-btn-success"
          disabled={!!busy[clicksignKey]}
          onClick={() => enviarClicksign(i.id)}
          title="Enviar para assinatura via Clicksign"
          style={{ background: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
        >
          {busy[clicksignKey] ? <Spinner size="sm" animation="border" /> : <>✍️ Clicksign</>}
        </button>

        <button
          className={`galaxy-card-btn ${
            copiedPaymentId === i.id ? 'galaxy-card-btn-primary' : 'galaxy-card-btn-secondary'
          }`}
          onClick={() => copyPaymentLink(i.id)}
          title="Copiar link de pagamento"
        >
          {copiedPaymentId === i.id ? '✓ Copiado!' : '🔗 Link'}
        </button>

        <button
          className="galaxy-card-btn galaxy-card-btn-secondary"
          onClick={() => openAgendamentoModal(i)}
          title="Agendar pagamento"
        >
          📅 Agendar
        </button>

        <button
          className="galaxy-card-btn galaxy-card-btn-secondary"
          onClick={() => {
            if (window.confirm(`Tem certeza que deseja excluir a inscrição de ${i.nomeCompleto}?`)) {
              deletar(i.id)
            }
          }}
          title="Excluir inscrição"
          style={{ background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
        >
          🗑️ Excluir
        </button>
      </div>
    </div>
  )
}

export default InscricaoCard
