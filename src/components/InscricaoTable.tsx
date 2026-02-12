import React, { useState } from 'react'
import { Badge, Form, Spinner, Dropdown } from 'react-bootstrap'
import { FileEarmarkPdf, Whatsapp, Trash2, Calendar3, Link45deg, ThreeDotsVertical } from 'react-bootstrap-icons'
import type { Inscricao, EditableField, PaymentMode } from '../types/inscricao'

interface InscricaoTableProps {
  inscricoes: Inscricao[]
  curso: string
  busy: Record<string, boolean>
  money: (value: number) => string
  buildWhatsappUrl: (phone?: string) => string | null
  isFullstackCourse: (curso?: string) => boolean
  getPaymentMode: (i: Inscricao) => PaymentMode
  formatDateTime: (date?: string | null) => string
  keyBusy: (id: string, field: string) => string
  toggleField: (id: string, currentValue: boolean | null | undefined, field: 'pago' | 'grupoWhatsapp' | 'remoto') => Promise<void>
  updateField: <K extends EditableField>(id: string, field: K, value: Inscricao[K]) => Promise<void>
  gerarContrato: (id: string) => void
  enviarClicksign: (id: string) => void
  copyPaymentLink: (id: string) => void
  openAgendamentoModal: (i: Inscricao) => void
  deletar: (id: string) => void
  copiedPaymentId: string | null
  getFieldClassName?: (fieldKey: string) => string
  ASAAS_STATUS_LABELS: Record<string, string>
  ASAAS_STATUS_VARIANTS: Record<string, string>
}

const InscricaoTable: React.FC<InscricaoTableProps> = ({
  inscricoes,
  curso,
  busy,
  money,
  buildWhatsappUrl,
  getPaymentMode,
  formatDateTime,
  keyBusy,
  toggleField,
  updateField,
  gerarContrato,
  enviarClicksign,
  copyPaymentLink,
  openAgendamentoModal,
  deletar,
  copiedPaymentId,
  getFieldClassName,
  ASAAS_STATUS_LABELS,
  ASAAS_STATUS_VARIANTS
}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  
  const calcularIdade = (dataNascimento?: string | null): number | null => {
    if (!dataNascimento) return null
    
    let data: Date
    
    if (dataNascimento.includes('-')) {
      const [ano, mes, dia] = dataNascimento.split('-').map(Number)
      data = new Date(ano, mes - 1, dia)
    } else if (dataNascimento.includes('/')) {
      const [dia, mes, ano] = dataNascimento.split('/').map(Number)
      data = new Date(ano, mes - 1, dia)
    } else {
      return null
    }
    
    const hoje = new Date()
    let idade = hoje.getFullYear() - data.getFullYear()
    const mesAtual = hoje.getMonth()
    const mesNasc = data.getMonth()
    
    if (mesAtual < mesNasc || (mesAtual === mesNasc && hoje.getDate() < data.getDate())) {
      idade--
    }
    
    return idade
  }

  return (
    <div className="galaxy-table-responsive">
      <table className="galaxy-inscricoes-table">
        <thead>
          <tr>
            <th className="col-expand"></th>
            <th className="col-nome">Nome</th>
            <th className="col-email">Email</th>
            <th className="col-telefone">Telefone</th>
            <th className="col-valor text-end">Valor</th>
            <th className="col-status text-center">Status</th>
            <th className="col-modalidade text-center">Modalidade</th>
            <th className="col-data">Data</th>
            <th className="col-acoes text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          {inscricoes.map(i => {
            const pagoKey = keyBusy(i.id, 'pago')
            const grupoKey = keyBusy(i.id, 'grupoWhatsapp')
            const remotoKey = keyBusy(i.id, 'remoto')
            const obsKey = keyBusy(i.id, 'observacoes')
            
            const pagoChecked = Boolean(i.pago)
            const grupoChecked = Boolean(i.grupoWhatsapp)
            const remotoChecked = Boolean(i.remoto)
            
            const whatsappUrl = buildWhatsappUrl(i.whatsapp)
            const paymentMode = getPaymentMode(i)
            
            const idade = calcularIdade(i.dataNascimento)
            const isMenorDeIdade = idade !== null && idade < 18
            
            const asaasStatusLabel = i.asaasPaymentStatus ? ASAAS_STATUS_LABELS[i.asaasPaymentStatus.toUpperCase()] || i.asaasPaymentStatus : null
            const asaasStatusVariant = i.asaasPaymentStatus ? ASAAS_STATUS_VARIANTS[i.asaasPaymentStatus.toUpperCase()] || 'secondary' : 'secondary'
            
            const isExpanded = expandedRow === i.id
            
            return (
              <React.Fragment key={i.id}>
                <tr className={`galaxy-table-row ${isExpanded ? 'expanded' : ''}`}>
                  {/* Expand Button */}
                  <td className="col-expand">
                    <button
                      className="galaxy-expand-btn"
                      onClick={() => setExpandedRow(isExpanded ? null : i.id)}
                      title={isExpanded ? 'Recolher' : 'Expandir detalhes'}
                    >
                      {isExpanded ? '−' : '+'}
                    </button>
                  </td>
                  
                  {/* Nome */}
                  <td className="col-nome">
                    <div className="table-cell-content">
                      <strong>{i.nomeCompleto}</strong>
                      {isMenorDeIdade && (
                        <Badge bg="danger" className="ms-2" style={{ fontSize: '0.65rem' }}>
                          Menor ({idade})
                        </Badge>
                      )}
                    </div>
                  </td>
                  
                  {/* Email */}
                  <td className="col-email">
                    <span className="table-email">{i.email}</span>
                  </td>
                  
                  {/* Telefone */}
                  <td className="col-telefone">
                    <div className="d-flex align-items-center gap-2">
                      <span>{i.whatsapp || '—'}</span>
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="galaxy-icon-link"
                          title="Abrir WhatsApp"
                        >
                          <Whatsapp size={16} />
                        </a>
                      )}
                    </div>
                  </td>
                  
                  {/* Valor */}
                  <td className="col-valor text-end">
                    <strong className="table-value">{money(i.valorCurso || 0)}</strong>
                  </td>
                  
                  {/* Status */}
                  <td className="col-status text-center">
                    <div className="d-flex flex-column align-items-center gap-1">
                      <Form.Check
                        type="switch"
                        id={`table-pago-${i.id}`}
                        checked={pagoChecked}
                        disabled={!!busy[pagoKey]}
                        onChange={() => toggleField(i.id, i.pago, 'pago')}
                        label={pagoChecked ? 'Pago' : 'Pendente'}
                        className="galaxy-table-switch"
                      />
                      {asaasStatusLabel && (
                        <Badge bg={asaasStatusVariant} style={{ fontSize: '0.6rem' }}>
                          {asaasStatusLabel}
                        </Badge>
                      )}
                    </div>
                  </td>
                  
                  {/* Modalidade */}
                  <td className="col-modalidade text-center">
                    <Form.Check
                      type="switch"
                      id={`table-remoto-${i.id}`}
                      checked={remotoChecked}
                      disabled={!!busy[remotoKey]}
                      onChange={() => toggleField(i.id, i.remoto, 'remoto')}
                      label={remotoChecked ? '💻 Remoto' : '🏢 Presencial'}
                      className="galaxy-table-switch"
                    />
                  </td>
                  
                  {/* Data */}
                  <td className="col-data">
                    <span className="text-muted small">{formatDateTime(i.dataInscricao)}</span>
                  </td>
                  
                  {/* Ações */}
                  <td className="col-acoes text-end">
                    <Dropdown align="end">
                      <Dropdown.Toggle variant="link" size="sm" className="galaxy-actions-toggle">
                        <ThreeDotsVertical />
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="galaxy-dropdown-menu">
                        <Dropdown.Item onClick={() => gerarContrato(i.id)}>
                          <FileEarmarkPdf className="me-2" /> Gerar Contrato
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => enviarClicksign(i.id)}>
                          📄 Enviar Clicksign
                        </Dropdown.Item>
                        <Dropdown.Item 
                          onClick={() => copyPaymentLink(i.id)}
                          className={copiedPaymentId === i.id ? 'text-success' : ''}
                        >
                          <Link45deg className="me-2" />
                          {copiedPaymentId === i.id ? 'Copiado!' : 'Copiar Link Pagamento'}
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => openAgendamentoModal(i)}>
                          <Calendar3 className="me-2" /> Agendar Pagamento
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item 
                          onClick={() => {
                            if (window.confirm(`Excluir inscrição de ${i.nomeCompleto}?`)) {
                              deletar(i.id)
                            }
                          }}
                          className="text-danger"
                        >
                          <Trash2 className="me-2" /> Excluir
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
                
                {/* Linha Expandida com Detalhes */}
                {isExpanded && (
                  <tr className="galaxy-table-expanded-row">
                    <td colSpan={9}>
                      <div className="galaxy-expanded-content">
                        <div className="row g-3">
                          {/* Coluna 1: Informações Pessoais */}
                          <div className="col-md-4">
                            <h6 className="galaxy-expanded-title">📋 Informações Pessoais</h6>
                            <div className="galaxy-expanded-field">
                              <label>Data de Inscricão:</label>
                              <span>{formatDateTime(i.dataInscricao)}</span>
                            </div>
                            <div className="galaxy-expanded-field">
                              <label>Data de Nascimento:</label>
                              <span>{i.dataNascimento || '—'} {idade && `(${idade} anos)`}</span>
                            </div>
                            <div className="galaxy-expanded-field">
                              <label>Curso:</label>
                              <span>{i.curso || curso}</span>
                            </div>
                            
                            {/* Responsável Legal (se menor) */}
                            {isMenorDeIdade && (
                              <>
                                <h6 className="galaxy-expanded-title mt-3">👤 Responsável Legal</h6>
                                <div className="galaxy-expanded-field">
                                  <label>Nome:</label>
                                  <input
                                    type="text"
                                    className={`form-control form-control-sm ${getFieldClassName ? getFieldClassName(`${i.id}-responsavelNome`) : ''}`}
                                    value={i.responsavelNome || ''}
                                    placeholder="Nome do responsável"
                                    onBlur={e => updateField(i.id, 'responsavelNome', e.target.value || null)}
                                    onChange={e => e.target.value}
                                  />
                                </div>
                                <div className="galaxy-expanded-field">
                                  <label>CPF:</label>
                                  <input
                                    type="text"
                                    className={`form-control form-control-sm ${getFieldClassName ? getFieldClassName(`${i.id}-responsavelCpf`) : ''}`}
                                    value={i.responsavelCpf || ''}
                                    placeholder="000.000.000-00"
                                    onBlur={e => updateField(i.id, 'responsavelCpf', e.target.value || null)}
                                    onChange={e => e.target.value}
                                  />
                                </div>
                                <div className="galaxy-expanded-field">
                                  <label>Email:</label>
                                  <input
                                    type="email"
                                    className={`form-control form-control-sm ${getFieldClassName ? getFieldClassName(`${i.id}-responsavelEmail`) : ''}`}
                                    value={i.responsavelEmail || ''}
                                    placeholder="email@responsavel.com"
                                    onBlur={e => updateField(i.id, 'responsavelEmail', e.target.value || null)}
                                    onChange={e => e.target.value}
                                  />
                                </div>
                                <div className="galaxy-expanded-field">
                                  <label>Telefone:</label>
                                  <input
                                    type="tel"
                                    className={`form-control form-control-sm ${getFieldClassName ? getFieldClassName(`${i.id}-responsavelTelefone`) : ''}`}
                                    value={i.responsavelTelefone || ''}
                                    placeholder="(00) 00000-0000"
                                    onBlur={e => updateField(i.id, 'responsavelTelefone', e.target.value || null)}
                                    onChange={e => e.target.value}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                          
                          {/* Coluna 2: Pagamento */}
                          <div className="col-md-4">
                            <h6 className="galaxy-expanded-title">💰 Pagamento</h6>
                            <div className="galaxy-expanded-field">
                              <label>Modo:</label>
                              <span>{paymentMode === 'monthly' ? 'Mensalidades (6x)' : 'Pagamento Único'}</span>
                            </div>
                            <div className="galaxy-expanded-field">
                              <label>Status Asaas:</label>
                              {asaasStatusLabel ? (
                                <Badge bg={asaasStatusVariant}>{asaasStatusLabel}</Badge>
                              ) : (
                                <span>—</span>
                              )}
                            </div>
                            <div className="galaxy-expanded-field">
                              <label>Clicksign:</label>
                              {i.clicksignStatus ? (
                                <Badge bg={i.clicksignStatus === 'signed' ? 'success' : 'warning'}>
                                  {i.clicksignStatus === 'signed' ? '✓ Assinado' : '⏱ Pendente'}
                                </Badge>
                              ) : (
                                <span>—</span>
                              )}
                            </div>
                            
                            <div className="mt-3">
                              <Form.Check
                                type="switch"
                                id={`table-grupo-${i.id}`}
                                checked={grupoChecked}
                                disabled={!!busy[grupoKey]}
                                onChange={() => toggleField(i.id, i.grupoWhatsapp, 'grupoWhatsapp')}
                                label="Grupo WhatsApp"
                                className="mb-2"
                              />
                            </div>
                          </div>
                          
                          {/* Coluna 3: Observações */}
                          <div className="col-md-4">
                            <h6 className="galaxy-expanded-title">📝 Observações</h6>
                            <textarea
                              className={`form-control form-control-sm ${getFieldClassName ? getFieldClassName(`${i.id}-observacoes`) : ''}`}
                              value={i.observacoes || ''}
                              placeholder="Anotações internas…"
                              disabled={!!busy[obsKey]}
                              onBlur={e => updateField(i.id, 'observacoes', e.target.value || null)}
                              onChange={e => e.target.value}
                              rows={4}
                              style={{ resize: 'vertical' }}
                            />
                            {busy[obsKey] && (
                              <div className="mt-1">
                                <Spinner size="sm" animation="border" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default InscricaoTable
