export type MonthlyPaymentStatus = 'ok' | 'late'

export type MonthlyPaymentSlot = {
  index: number
  amount?: number | null
  status?: MonthlyPaymentStatus | null
}

export type PaymentMode = 'one-time' | 'monthly'

export type Inscricao = {
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
  dataNascimento?: string | null
  
  // Dados do responsável (menor de idade)
  responsavelNome?: string | null
  responsavelCpf?: string | null
  responsavelEmail?: string | null
  responsavelTelefone?: string | null
  
  // Clicksign
  clicksignDocumentKey?: string | null
  clicksignStatus?: string | null
  clicksignSentAt?: string | null
}

export type EditableField =
  | 'valorLiquidoFinal'
  | 'observacoes'
  | 'paymentMode'
  | 'monthlyPayments'
  | 'valorPrevisto'
  | 'responsavelNome'
  | 'responsavelCpf'
  | 'responsavelEmail'
  | 'responsavelTelefone'
