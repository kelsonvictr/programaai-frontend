import { useState, useEffect, useMemo, useRef } from 'react'
import axios from 'axios'
import { auth } from '../firebase'
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, type User } from 'firebase/auth'
import {
  Container,
  Table,
  Button,
  Form,
  Spinner,
  Alert,
  Badge,
  Row,
  Col,
  Card,
  Modal
} from 'react-bootstrap'
import { ArrowClockwise, BoxArrowRight, People, Laptop, Building, CurrencyDollar, Calendar3, Cup, ListUl, ClockHistory, BookHalf } from 'react-bootstrap-icons'
import GalaxyCalendar from '../components/GalaxyCalendar'
import InscricaoCard from '../components/InscricaoCard'
import WaitlistCard from '../components/WaitlistCard'
import GalaxyCourseManager from '../components/GalaxyCourseManager'
import '../styles/galaxy-admin.css'

const API_BASE = import.meta.env.VITE_ADMIN_API as string
const ENDPOINT = `${API_BASE}/galaxy/inscricoes-por-curso`
const WAITLIST_ENDPOINT = `${API_BASE}/galaxy/lista-espera`
const TOGGLE_ENDPOINT = `${API_BASE}/galaxy/inscricoes/toggle`
const UPDATE_ENDPOINT = `${API_BASE}/galaxy/inscricoes/update`
const CONTRATO_ENDPOINT = (id: string) => `${API_BASE}/galaxy/inscricoes/${id}/contrato`
const AGENDAMENTO_ENDPOINT = `${API_BASE}/galaxy/agendamento-pagamento`
const AGENDAMENTO_CANCEL_ENDPOINT = `${API_BASE}/galaxy/agendamento-pagamento/cancelar`
const AGENDAMENTO_SEND_ENDPOINT = `${API_BASE}/galaxy/agendamento-pagamento/enviar-lembrete`
const BEBIDAS_ENDPOINT = `${API_BASE}/galaxy/bebidas`
const BEBIDAS_ITEM_ENDPOINT = (id: string) => `${API_BASE}/galaxy/bebidas/${id}`
const BEBIDAS_PEDIDO_CONFIRMAR_ENDPOINT = `${API_BASE}/galaxy/bebidas/pedido/confirmar`
const BEBIDAS_PEDIDO_EXCLUIR_ENDPOINT = `${API_BASE}/galaxy/bebidas/pedido/excluir`
const BEBIDAS_AGENDAMENTO_CONFIRMAR_ENDPOINT = `${API_BASE}/galaxy/bebidas/agendamento/confirmar`
const BEBIDAS_AGENDAMENTO_EXCLUIR_ENDPOINT = `${API_BASE}/galaxy/bebidas/agendamento/excluir`
const MONTHLY_SLOTS = 6
const FULLSTACK_KEYWORD = 'fullstack'

type PaymentMode = 'one-time' | 'monthly'
type MonthlyPaymentStatus = 'ok' | 'late'

type MonthlyPaymentSlot = {
  index: number
  amount?: number | null
  status?: MonthlyPaymentStatus | null
}

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
}

type WaitlistEntry = {
  id: string
  nome: string
  email: string
  telefone?: string
  curso: string
  criadoEm: string
  comoConheceu?: string
}

type CursoGroup = {
  inscricoes: Inscricao[]
  totalInscritos: number
  totalValorLiquido: number
  qtdeRemoto: number
  qtdePresencial: number
}

type ApiResp = {
  total: number
  cursos: Record<string, CursoGroup>
}

type WaitlistCursoGroup = {
  itens: WaitlistEntry[]
  total: number
}

type WaitlistApiResp = {
  total: number
  cursos: Record<string, WaitlistCursoGroup & { ultimoCriadoEm?: string }>
}

type AgendamentoPagamento = {
  id: string
  inscricaoId: string
  scheduledDate?: string | null
  status?: string | null
}

type Bebida = {
  id: string
  nome: string
  preco: number
  estoqueAtual: number
  ativo: boolean
  imagemUrl?: string | null
  imagemUrlSigned?: string | null
  criadoEm?: string
  updatedAt?: string
}

type BebidaItem = {
  bebidaId?: string
  nome?: string
  quantidade?: number
  precoUnitario?: number
  subtotal?: number
}

type BebidaPedido = {
  id: string
  total: number
  status: string
  usuarioNome?: string
  usuarioEmail?: string
  usuarioTelefone?: string
  confirmadoEm?: string
  criadoEm?: string
  itens?: BebidaItem[]
}

type BebidaAgendamento = {
  id: string
  total: number
  status: string
  usuarioNome?: string
  usuarioEmail?: string
  usuarioTelefone?: string
  confirmadoEm?: string
  origem?: string
  criadoEm?: string
  itens?: BebidaItem[]
}

type BebidasAdminResp = {
  bebidas: Bebida[]
  pedidos?: BebidaPedido[]
  pedidosPagos?: BebidaPedido[]
  agendamentos?: BebidaAgendamento[]
  agendamentosPendentes?: BebidaAgendamento[]
}

type EditableField =
  | 'valorLiquidoFinal'
  | 'observacoes'
  | 'paymentMode'
  | 'monthlyPayments'
  | 'valorPrevisto'

const ASAAS_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Aguardando',
  RECEIVED: 'Recebido',
  CONFIRMED: 'Confirmado',
  OVERDUE: 'Em atraso',
  REFUNDED: 'Estornado',
  RECEIVED_IN_CASH: 'Recebido (dinheiro)',
  CHARGEBACK: 'Chargeback',
  CHARGEBACK_REQUESTED: 'Chargeback solicitado',
  CHARGEBACK_DISPUTE: 'Em disputa',
  AWAITING_RISK_ANALYSIS: 'Em análise',
  DUNNING_REQUESTED: 'Cobrança solicitada',
  DUNNING_RECEIVED: 'Cobrança recebida',
  DUNNING_RECEIVED_IN_CASH: 'Cobrança recebida (dinheiro)',
  PROTEST_REQUESTED: 'Protesto solicitado',
  PROTESTED: 'Protestado',
  PROTEST_CANCELED: 'Protesto cancelado',
  CANCELLED: 'Cancelado'
}

const ASAAS_STATUS_VARIANTS: Record<string, string> = {
  RECEIVED: 'success',
  CONFIRMED: 'success',
  RECEIVED_IN_CASH: 'success',
  DUNNING_RECEIVED: 'success',
  DUNNING_RECEIVED_IN_CASH: 'success',
  PENDING: 'secondary',
  AWAITING_RISK_ANALYSIS: 'warning',
  OVERDUE: 'danger',
  REFUNDED: 'dark',
  CHARGEBACK: 'danger',
  CHARGEBACK_REQUESTED: 'danger',
  CHARGEBACK_DISPUTE: 'danger',
  PROTEST_REQUESTED: 'danger',
  PROTESTED: 'danger',
  PROTEST_CANCELED: 'secondary',
  CANCELLED: 'secondary'
}

export default function Admin() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [cursos, setCursos] = useState<Record<string, CursoGroup>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string>('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // 2FA Login
  const [show2FALogin, setShow2FALogin] = useState(false)
  const [code2FALogin, setCode2FALogin] = useState('')
  const [sending2FALogin, setSending2FALogin] = useState(false)

  // loading por toggle/atualização (chaves: "id:field")
  const [busy, setBusy] = useState<Record<string, boolean>>({})
  const [copiedPaymentId, setCopiedPaymentId] = useState<string | null>(null)
  const copyFeedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const ALL_CURSO_KEY = '__all__'
  const [activeCurso, setActiveCurso] = useState<string>(ALL_CURSO_KEY)
  const [activeView, setActiveView] = useState<'inscricoes' | 'calendario' | 'lista-espera' | 'bebidas' | 'cursos'>(
    'inscricoes'
  )

  const [waitlistCursos, setWaitlistCursos] = useState<Record<string, WaitlistCursoGroup>>({})
  const [activeWaitlistCurso, setActiveWaitlistCurso] = useState<string>(ALL_CURSO_KEY)

  // agendamentoCache removed - not used in card-based UI but setAgendamentoCache still needed for modal operations
  const [, setAgendamentoCache] = useState<Record<string, AgendamentoPagamento | null>>(
    {}
  )
  const [agendamentoModalOpen, setAgendamentoModalOpen] = useState(false)
  const [agendamentoInscricao, setAgendamentoInscricao] = useState<Inscricao | null>(null)
  const [agendamentoDate, setAgendamentoDate] = useState('')
  const [agendamentoBusy, setAgendamentoBusy] = useState(false)
  const [agendamentoError, setAgendamentoError] = useState<string | null>(null)
  const [agendamentoSuccess, setAgendamentoSuccess] = useState<string | null>(null)

  const [bebidas, setBebidas] = useState<Bebida[]>([])
  const [bebidasLoading, setBebidasLoading] = useState(false)
  const [bebidasError, setBebidasError] = useState<string | null>(null)
  const [bebidaForm, setBebidaForm] = useState({
    id: '',
    nome: '',
    preco: '',
    estoqueAtual: '',
    ativo: true,
    imagemUrl: ''
  })
  const [bebidaImageUploading, setBebidaImageUploading] = useState(false)
  const [bebidaImagePreview, setBebidaImagePreview] = useState<string>("")
  const [pedidosBebidas, setPedidosBebidas] = useState<BebidaPedido[]>([])
  const [agendamentosBebidas, setAgendamentosBebidas] = useState<BebidaAgendamento[]>([])
  const [pedidoSortAsc, setPedidoSortAsc] = useState(false)
  const [agendamentoSortAsc, setAgendamentoSortAsc] = useState(false)

  const cursoEntries = useMemo(
    () => Object.entries(cursos).sort(([a], [b]) => a.localeCompare(b, 'pt-BR')),
    [cursos]
  )

  const globalResumo = useMemo(
    () =>
      cursoEntries.reduce(
        (acc, [, group]) => ({
          totalInscritos: acc.totalInscritos + group.totalInscritos,
          qtdeRemoto: acc.qtdeRemoto + group.qtdeRemoto,
          qtdePresencial: acc.qtdePresencial + group.qtdePresencial,
          totalValorLiquido: acc.totalValorLiquido + group.totalValorLiquido
        }),
        { totalInscritos: 0, qtdeRemoto: 0, qtdePresencial: 0, totalValorLiquido: 0 }
      ),
    [cursoEntries]
  )

  const waitlistCursoEntries = useMemo(
    () => Object.entries(waitlistCursos).sort(([a], [b]) => a.localeCompare(b, 'pt-BR')),
    [waitlistCursos]
  )

  const waitlistResumo = useMemo(
    () =>
      waitlistCursoEntries.reduce(
        (acc, [, group]) => ({
          total: acc.total + group.total
        }),
        { total: 0 }
      ),
    [waitlistCursoEntries]
  )

  useEffect(() => {
    if (!cursoEntries.length) {
      setActiveCurso(ALL_CURSO_KEY)
      return
    }

    if (activeCurso !== ALL_CURSO_KEY && !cursos[activeCurso]) {
      setActiveCurso(cursoEntries[0][0])
    }
  }, [cursoEntries, cursos, activeCurso])

  useEffect(() => {
    if (!waitlistCursoEntries.length) {
      setActiveWaitlistCurso(ALL_CURSO_KEY)
      return
    }

    if (activeWaitlistCurso !== ALL_CURSO_KEY && !waitlistCursos[activeWaitlistCurso]) {
      setActiveWaitlistCurso(waitlistCursoEntries[0][0])
    }
  }, [waitlistCursoEntries, waitlistCursos, activeWaitlistCurso])

  useEffect(
    () => () => {
      if (copyFeedbackTimeout.current) {
        clearTimeout(copyFeedbackTimeout.current)
      }
    },
    []
  )

  useEffect(() => {
    onAuthStateChanged(auth, async u => {
      setLoading(true)
      setUser(u)
      
      if (u) {
        console.log('[Auth] Firebase user authenticated:', u.email)
        
        // Buscar session token do 2FA (não mais Firebase token)
        const storedSessionToken = localStorage.getItem('galaxySessionToken')
        
        if (storedSessionToken) {
          console.log('[Auth] ✅ Session token found - restoring session')
          
          // Configurar axios com session token
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedSessionToken}`
          setToken(storedSessionToken)
          
          // Buscar dados
          fetchInscricoes(storedSessionToken)
        } else {
          console.log('[Auth] ⚠️ No session token - 2FA required')
          // Usuário precisa fazer 2FA
        }
      } else {
        console.log('[Auth] No Firebase user - logged out')
        setToken('')
        localStorage.removeItem('galaxySessionToken')
        localStorage.removeItem('galaxyEmail')
        delete axios.defaults.headers.common['Authorization']
      }
      
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (activeView !== 'bebidas' || !token) return
    void fetchBebidasAdmin(token)
  }, [activeView, token])

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try {
      // Passo 1: Autenticar no Firebase
      const cred = await signInWithEmailAndPassword(auth, email, senha)
      const fbToken = await cred.user.getIdToken()
      
      console.log('[2FA] Firebase login OK, requesting 2FA code...', cred.user.email)
      
      // Passo 2: Solicitar código 2FA (OBRIGATÓRIO)
      setSending2FALogin(true)
      const response = await axios.post(
        `${API_BASE}/galaxy/auth/request-2fa`,
        { email: cred.user.email, firebaseToken: fbToken }
      )
      
      console.log('[2FA] Code request response:', response.data)
      setSending2FALogin(false)
      
      // Código enviado! Mostrar modal OBRIGATORIAMENTE
      setUser(cred.user)
      setShow2FALogin(true)
      setError(null)
      console.log('[2FA] Modal opened, waiting for code...')
      
    } catch (err: any) {
      setSending2FALogin(false)
      console.error('[2FA] Login error:', err)
      
      // Fazer logout do Firebase em caso de erro
      await signOut(auth)
      
      if (err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erro ao efetuar login')
      }
    } finally {
      setLoading(false)
    }
  }

  const verify2FALogin = async () => {
    setError(null)
    setLoading(true)
    
    try {
      console.log('[2FA] Verifying code...')
      
      const response = await axios.post(
        `${API_BASE}/galaxy/auth/verify-2fa`,
        { email, code: code2FALogin }
      )
      
      const { sessionToken, email: verifiedEmail } = response.data
      
      if (sessionToken) {
        console.log('[2FA] ✅ Session token received')
        
        // Armazenar session token (não mais Firebase token)
        localStorage.setItem('galaxySessionToken', sessionToken)
        localStorage.setItem('galaxyEmail', verifiedEmail)
        
        // Configurar axios com session token
        axios.defaults.headers.common['Authorization'] = `Bearer ${sessionToken}`
        
        setToken(sessionToken)
        setShow2FALogin(false)
        setCode2FALogin('')
        
        console.log('[2FA] ✅ Session token stored, 2FA complete')
        
        // Buscar dados com session token
        fetchInscricoes(sessionToken)
      }
      
    } catch (err: any) {
      console.error('[2FA] Verification failed:', err)
      if (err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError('Código inválido ou expirado')
      }
    } finally {
      setLoading(false)
    }
  }

  const cancel2FALogin = async () => {
    console.log('[2FA] Cancelled - signing out')
    
    // Fazer logout do Firebase
    await signOut(auth)
    
    // Limpar estados
    setShow2FALogin(false)
    setCode2FALogin('')
    setUser(null)
    setError(null)
    
    // Limpar storage
    localStorage.removeItem('galaxySessionToken')
    localStorage.removeItem('galaxyEmail')
    delete axios.defaults.headers.common['Authorization']
  }

  const logout = async () => {
    console.log('[Auth] Logging out...')
    
    await signOut(auth)
    
    // Limpar session token e dados do localStorage
    localStorage.removeItem('galaxySessionToken')
    localStorage.removeItem('galaxyEmail')
    delete axios.defaults.headers.common['Authorization']
    
    // Limpar states
    setCursos({})
    setWaitlistCursos({})
    setToken('')
    setLastUpdated(null)
    setActiveCurso(ALL_CURSO_KEY)
    setActiveWaitlistCurso(ALL_CURSO_KEY)
    setBebidas([])
    setPedidosBebidas([])
    setAgendamentosBebidas([])
    resetBebidaForm()
    resetBebidaPreview()
    
    console.log('[Auth] ✅ Logout complete')
  }

  const fetchInscricoes = async (jwt: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get<ApiResp>(ENDPOINT, {
        headers: { Authorization: `Bearer ${jwt}` }
      })

      // garantir ordenação desc por data dentro de cada curso
      const normalized: Record<string, CursoGroup> = {}
      Object.entries(data.cursos || {}).forEach(([curso, group]) => {
        const listaOrdenada = [...(group.inscricoes || [])].sort(
          (a, b) => new Date(b.dataInscricao).getTime() - new Date(a.dataInscricao).getTime()
        )
        const totalInscritos = listaOrdenada.length
        const qtdeRemoto = listaOrdenada.filter(i => i.remoto === true).length
        const qtdePresencial = totalInscritos - qtdeRemoto
        const totalValorLiquido = listaOrdenada.reduce(
          (acc, inscricao) => acc + getEffectiveValorLiquido(curso, inscricao),
          0
        )
        normalized[curso] = {
          ...group,
          inscricoes: listaOrdenada,
          totalInscritos,
          qtdeRemoto,
          qtdePresencial,
          totalValorLiquido
        }
      })

      setCursos(normalized)
      setLastUpdated(new Date())
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar inscrições')
    } finally {
      setLoading(false)
    }
  }

  const fetchWaitlist = async (jwt: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get<WaitlistApiResp>(WAITLIST_ENDPOINT, {
        headers: { Authorization: `Bearer ${jwt}` }
      })

      const normalized: Record<string, WaitlistCursoGroup> = {}
      Object.entries(data.cursos || {}).forEach(([curso, group]) => {
        const itensOrdenados = [...(group.itens || [])].sort((a, b) => {
          const da = new Date(a.criadoEm).getTime()
          const db = new Date(b.criadoEm).getTime()
          if (Number.isNaN(da) && Number.isNaN(db)) return 0
          if (Number.isNaN(da)) return 1
          if (Number.isNaN(db)) return -1
          return db - da
        })

        normalized[curso] = {
          itens: itensOrdenados,
          total: itensOrdenados.length
        }
      })

      setWaitlistCursos(normalized)
      setLastUpdated(new Date())
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar lista de espera')
    } finally {
      setLoading(false)
    }
  }

  const resetBebidaForm = () =>
    setBebidaForm({
      id: '',
      nome: '',
      preco: '',
      estoqueAtual: '',
      ativo: true,
      imagemUrl: ''
    })
  const resetBebidaPreview = () => setBebidaImagePreview("")

  const fetchBebidasAdmin = async (jwt: string) => {
    setBebidasLoading(true)
    setBebidasError(null)
    try {
      const { data } = await axios.get<BebidasAdminResp>(BEBIDAS_ENDPOINT, {
        headers: { Authorization: `Bearer ${jwt}` }
      })
      setBebidas(data.bebidas || [])
      setPedidosBebidas(data.pedidos || data.pedidosPagos || [])
      setAgendamentosBebidas(data.agendamentos || data.agendamentosPendentes || [])
      setLastUpdated(new Date())
    } catch (err) {
      console.error(err)
      setBebidasError('Erro ao carregar bebidas')
    } finally {
      setBebidasLoading(false)
    }
  }

  const submitBebidaForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setBebidasError(null)

    const nome = bebidaForm.nome.trim()
    const precoValue = Number(String(bebidaForm.preco).replace(',', '.'))
    const estoqueValue = Number(String(bebidaForm.estoqueAtual))
    if (!nome || !Number.isFinite(precoValue) || !Number.isFinite(estoqueValue)) {
      setBebidasError('Preencha nome, preço e estoque corretamente.')
      return
    }

    const payload = {
      nome,
      preco: precoValue,
      estoqueAtual: Math.max(0, Math.floor(estoqueValue)),
      ativo: bebidaForm.ativo,
      imagemUrl: bebidaForm.imagemUrl || undefined
    }

    try {
      if (bebidaForm.id) {
        await axios.put(BEBIDAS_ITEM_ENDPOINT(bebidaForm.id), payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post(BEBIDAS_ENDPOINT, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      resetBebidaForm()
      resetBebidaPreview()
      await fetchBebidasAdmin(token)
    } catch (err) {
      console.error(err)
      setBebidasError('Erro ao salvar bebida')
    }
  }

  const editBebida = (bebida: Bebida) => {
    setBebidaForm({
      id: bebida.id,
      nome: bebida.nome || '',
      preco: bebida.preco?.toString() || '',
      estoqueAtual: bebida.estoqueAtual?.toString() || '',
      ativo: bebida.ativo ?? true,
      imagemUrl: bebida.imagemUrl || ''
    })
    setBebidaImagePreview(bebida.imagemUrlSigned || bebida.imagemUrl || '')
  }

  const deleteBebida = async (id: string) => {
    if (!token) return
    if (!window.confirm('Tem certeza que deseja remover esta bebida?')) return
    setBebidasError(null)
    try {
      await axios.delete(BEBIDAS_ITEM_ENDPOINT(id), {
        headers: { Authorization: `Bearer ${token}` }
      })
      await fetchBebidasAdmin(token)
    } catch (err) {
      console.error(err)
      setBebidasError('Erro ao remover bebida')
    }
  }

  const confirmarPagamentoBebida = async (id: string, tipo: 'pedido' | 'agendamento') => {
    if (!token) return
    setBebidasError(null)
    const endpoint =
      tipo === 'pedido' ? BEBIDAS_PEDIDO_CONFIRMAR_ENDPOINT : BEBIDAS_AGENDAMENTO_CONFIRMAR_ENDPOINT
    try {
      await axios.post(endpoint, { id }, { headers: { Authorization: `Bearer ${token}` } })
      await fetchBebidasAdmin(token)
    } catch (err) {
      console.error(err)
      setBebidasError('Erro ao confirmar pagamento')
    }
  }

  const excluirRegistroBebida = async (id: string, tipo: 'pedido' | 'agendamento') => {
    if (!token) return
    setBebidasError(null)
    const endpoint =
      tipo === 'pedido' ? BEBIDAS_PEDIDO_EXCLUIR_ENDPOINT : BEBIDAS_AGENDAMENTO_EXCLUIR_ENDPOINT
    try {
      await axios.post(endpoint, { id }, { headers: { Authorization: `Bearer ${token}` } })
      await fetchBebidasAdmin(token)
    } catch (err) {
      console.error(err)
      setBebidasError('Erro ao excluir registro')
    }
  }

  const uploadBebidaImage = async (file: File) => {
    if (!token) return
    setBebidaImageUploading(true)
    setBebidasError(null)
    try {
      const { data } = await axios.post(
        `${BEBIDAS_ENDPOINT}/upload-url`,
        { fileName: file.name, contentType: file.type || 'application/octet-stream' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const uploadUrl = data?.uploadUrl as string
      const fileUrl = data?.fileUrl as string | undefined | null
      const fileKey = data?.fileKey as string | undefined | null
      if (!uploadUrl || !fileUrl || !fileKey) {
        throw new Error('URL de upload inválida')
      }
      const resp = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file
      })
      if (!resp.ok) {
        throw new Error('Falha no upload da imagem')
      }
      setBebidaForm(prev => ({ ...prev, imagemUrl: fileKey }))
      setBebidaImagePreview(fileUrl ?? '')
    } catch (err) {
      console.error(err)
      setBebidasError('Erro ao enviar imagem da bebida')
    } finally {
      setBebidaImageUploading(false)
    }
  }

  const handleBebidaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void uploadBebidaImage(file)
  }

  const handleBebidaPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items
    if (!items || !items.length) return
    const imageItem = Array.from(items).find(item => item.type.startsWith('image/'))
    if (!imageItem) return
    const blob = imageItem.getAsFile()
    if (!blob) return
    const ext = blob.type.split('/')[1] || 'png'
    const file = new File([blob], `bebida-paste.${ext}`, { type: blob.type })
    void uploadBebidaImage(file)
  }

  const deletar = async (id: string) => {
    void id
    alert('Excluir ainda não disponível nesta API')
  }

  const gerarContrato = async (id: string) => {
    if (!token) return
    const bkey = keyBusy(id, 'contrato')

    setBusy(s => ({ ...s, [bkey]: true }))
    setError(null)

    try {
      const { data } = await axios.get(CONTRATO_ENDPOINT(id), {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data?.ok && typeof data.url === 'string') {
        const opened = window.open(data.url, '_blank', 'noopener,noreferrer')
        if (!opened) {
          window.location.assign(data.url)
        }
      } else {
        alert('Não foi possível gerar o contrato.')
      }
    } catch (err) {
      console.error(err)
      alert('Falha ao gerar contrato.')
    } finally {
      setBusy(s => {
        const { [bkey]: removed, ...rest } = s
        void removed
        return rest
      })
    }
  }

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return ''
    const dt = new Date(iso)
    if (Number.isNaN(dt.getTime())) return iso
    return dt.toLocaleString()
  }

  const openAgendamentoModal = async (inscricao: Inscricao) => {
    setAgendamentoError(null)
    setAgendamentoSuccess(null)
    setAgendamentoInscricao(inscricao)
    setAgendamentoModalOpen(true)
    setAgendamentoBusy(true)
    try {
      const { data } = await axios.get<{ ok: boolean; agendamento?: AgendamentoPagamento | null }>(
        AGENDAMENTO_ENDPOINT,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { inscricaoId: inscricao.id }
        }
      )
      const agendamento = data.agendamento ?? null
      setAgendamentoCache(prev => ({ ...prev, [inscricao.id]: agendamento }))
      setAgendamentoDate((agendamento?.scheduledDate as string) || '')
    } catch {
      setAgendamentoCache(prev => ({ ...prev, [inscricao.id]: null }))
      setAgendamentoDate('')
    } finally {
      setAgendamentoBusy(false)
    }
  }

  const saveAgendamento = async () => {
    if (!agendamentoInscricao) return
    setAgendamentoError(null)
    setAgendamentoSuccess(null)
    setAgendamentoBusy(true)
    try {
      const { data } = await axios.post<{ ok: boolean; agendamento?: AgendamentoPagamento }>(
        AGENDAMENTO_ENDPOINT,
        { inscricaoId: agendamentoInscricao.id, scheduledDate: agendamentoDate },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const agendamento = data.agendamento ?? null
      setAgendamentoCache(prev => ({ ...prev, [agendamentoInscricao.id]: agendamento }))
      setAgendamentoModalOpen(false)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setAgendamentoError(err.response?.data?.detail || err.response?.data?.error || err.message)
      } else if (err instanceof Error) setAgendamentoError(err.message)
      else setAgendamentoError('Erro ao salvar agendamento')
    } finally {
      setAgendamentoBusy(false)
    }
  }

  const cancelAgendamento = async () => {
    if (!agendamentoInscricao) return
    setAgendamentoError(null)
    setAgendamentoSuccess(null)
    setAgendamentoBusy(true)
    try {
      await axios.post(
        AGENDAMENTO_CANCEL_ENDPOINT,
        { inscricaoId: agendamentoInscricao.id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAgendamentoCache(prev => ({
        ...prev,
        [agendamentoInscricao.id]: {
          id: agendamentoInscricao.id,
          inscricaoId: agendamentoInscricao.id,
          status: 'canceled'
        }
      }))
      setAgendamentoModalOpen(false)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setAgendamentoError(err.response?.data?.detail || err.response?.data?.error || err.message)
      } else if (err instanceof Error) setAgendamentoError(err.message)
      else setAgendamentoError('Erro ao cancelar agendamento')
    } finally {
      setAgendamentoBusy(false)
    }
  }

  const sendAgendamentoReminderToAluno = async () => {
    if (!agendamentoInscricao) return
    setAgendamentoError(null)
    setAgendamentoSuccess(null)
    setAgendamentoBusy(true)
    try {
      await axios.post(
        AGENDAMENTO_SEND_ENDPOINT,
        { inscricaoId: agendamentoInscricao.id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAgendamentoSuccess('Lembrete enviado ao aluno (email + SMS).')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setAgendamentoError(err.response?.data?.detail || err.response?.data?.error || err.message)
      } else if (err instanceof Error) setAgendamentoError(err.message)
      else setAgendamentoError('Erro ao enviar lembrete')
    } finally {
      setAgendamentoBusy(false)
    }
  }

  // helpers
  const money = (v?: number | null) =>
    typeof v === 'number' && !Number.isNaN(v) ? `R$ ${v.toFixed(2)}` : '-'
  const formatBrDateTime = (value?: string | null) => {
    if (!value) return '—'
    const dt = new Date(value)
    if (Number.isNaN(dt.getTime())) return '—'
    return dt.toLocaleString('pt-BR')
  }
  const formatBebidasItens = (itens?: BebidaItem[]) => {
    if (!Array.isArray(itens) || !itens.length) return '—'
    return (
      <div className="d-flex flex-column gap-1">
        {itens.map((item, idx) => {
          const nome = item.nome || item.bebidaId || '—'
          const qtd = item.quantidade ?? 0
          const subtotal = typeof item.subtotal === 'number' ? money(item.subtotal) : '—'
          return (
            <div key={`${nome}-${idx}`}>
              {nome} x{qtd} <span className="text-muted">({subtotal})</span>
            </div>
          )
        })}
      </div>
    )
  }
  const isFullstackCourse = (nome?: string | null) =>
    typeof nome === 'string' && nome.toLowerCase().includes(FULLSTACK_KEYWORD)
  const getPaymentMode = (inscricao: Inscricao): PaymentMode =>
    inscricao.paymentMode === 'monthly' ? 'monthly' : 'one-time'
  const usesMonthlyPayments = (cursoNome: string, inscricao: Inscricao) =>
    isFullstackCourse(cursoNome) && getPaymentMode(inscricao) === 'monthly'
  const ensureMonthlyPayments = (list?: MonthlyPaymentSlot[] | null): MonthlyPaymentSlot[] => {
    const base = Array.from({ length: MONTHLY_SLOTS }, (_, index) => ({
      index,
      amount: null,
      status: null
    }))
    if (!Array.isArray(list)) return base
    return base.map(slot => {
      const existing = list.find(item => item && typeof item.index === 'number' && item.index === slot.index)
      if (!existing) return slot
      const rawAmount =
        typeof existing.amount === 'number'
          ? existing.amount
          : typeof existing.amount === 'string'
            ? Number(existing.amount)
            : null
      const amountValue =
        typeof rawAmount === 'number' && Number.isFinite(rawAmount) ? rawAmount : null
      return {
        index: slot.index,
        amount: amountValue,
        status: existing.status ?? null
      }
    })
  }
  const sumMonthlyPayments = (list?: MonthlyPaymentSlot[] | null) =>
    ensureMonthlyPayments(list).reduce((acc, slot) => {
      const amount = typeof slot.amount === 'number' && !Number.isNaN(slot.amount) ? slot.amount : 0
      return acc + amount
    }, 0)
  const getEffectiveValorLiquido = (cursoNome: string, inscricao: Inscricao) => {
    if (usesMonthlyPayments(cursoNome, inscricao)) {
      return sumMonthlyPayments(inscricao.monthlyPayments)
    }
    const valor = inscricao.valorLiquidoFinal
    return typeof valor === 'number' && !Number.isNaN(valor) ? valor : 0
  }
  const keyBusy = (id: string, field: string) => `${id}:${field}`
  const pagamentoLink = (id: string) => `https://www.programaai.dev/pagamento/${id}`
  const buildWhatsappUrl = (value?: string | null) => {
    if (!value) return null
    const digits = value.replace(/\D/g, '')
    if (!digits) return null
    const normalized = digits.startsWith('55') ? digits : `55${digits}`
    return `https://wa.me/${normalized}`
  }
  const copyPaymentLink = async (id: string) => {
    const link = pagamentoLink(id)
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(link)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = link
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'absolute'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopiedPaymentId(id)
      if (copyFeedbackTimeout.current) clearTimeout(copyFeedbackTimeout.current)
      copyFeedbackTimeout.current = setTimeout(() => {
        setCopiedPaymentId(current => (current === id ? null : current))
      }, 2000)
    } catch (err) {
      console.error(err)
      alert(`Não foi possível copiar automaticamente. Link: ${link}`)
    }
  }

  const updateInscricao = (id: string, updater: (inscricao: Inscricao) => Inscricao) => {
    setCursos(prev => {
      const novo: typeof prev = {}
      for (const [curso, group] of Object.entries(prev)) {
        novo[curso] = {
          ...group,
          inscricoes: group.inscricoes.map(i => (i.id === id ? updater(i) : i))
        }
      }
      return novo
    })
  }

  // atualização otimista local de qualquer campo (dentro de um curso)
  const setLocalField = <K extends keyof Inscricao>(id: string, field: K, value: Inscricao[K]) => {
    updateInscricao(id, inscricao => ({ ...inscricao, [field]: value }))
  }

  // recalc totais (quando mexer em valorLiquidoFinal ou remoto, por exemplo)
  const recomputeAggregates = () => {
    setCursos(prev => {
      const novo: typeof prev = {}
      for (const [curso, group] of Object.entries(prev)) {
        const totalInscritos = group.inscricoes.length
        const qtdeRemoto = group.inscricoes.filter(i => i.remoto === true).length
        const qtdePresencial = totalInscritos - qtdeRemoto
        const totalValorLiquido = group.inscricoes.reduce(
          (acc, i) => acc + getEffectiveValorLiquido(curso, i),
          0
        )
        novo[curso] = { ...group, totalInscritos, qtdeRemoto, qtdePresencial, totalValorLiquido }
      }
      return novo
    })
  }

  const handlePaymentModeChange = (inscricao: Inscricao, mode: PaymentMode) => {
    updateInscricao(inscricao.id, current => {
      if (mode === 'monthly') {
        const normalized = ensureMonthlyPayments(current.monthlyPayments)
        return {
          ...current,
          paymentMode: mode,
          monthlyPayments: normalized,
          valorLiquidoFinal: sumMonthlyPayments(normalized)
        }
      }
      return { ...current, paymentMode: mode }
    })
    recomputeAggregates()
  }

  const handleMonthlyAmountChange = (inscricao: Inscricao, slotIndex: number, value: string) => {
    const parsed = value === '' ? null : Number(value)
    const amount = parsed === null || Number.isNaN(parsed) ? null : parsed
    updateInscricao(inscricao.id, current => {
      const normalized = ensureMonthlyPayments(current.monthlyPayments)
      const updated = normalized.map(slot =>
        slot.index === slotIndex ? { ...slot, amount } : slot
      )
      return {
        ...current,
        monthlyPayments: updated,
        valorLiquidoFinal: sumMonthlyPayments(updated)
      }
    })
    recomputeAggregates()
  }

  const handleMonthlyStatusChange = (
    inscricao: Inscricao,
    slotIndex: number,
    status: MonthlyPaymentStatus
  ) => {
    updateInscricao(inscricao.id, current => {
      const normalized = ensureMonthlyPayments(current.monthlyPayments)
      const updated = normalized.map(slot =>
        slot.index === slotIndex ? { ...slot, status } : slot
      )
      return {
        ...current,
        monthlyPayments: updated
      }
    })
  }

  const handleValorPrevistoChange = (inscricao: Inscricao, value: string) => {
    const parsed = value === '' ? null : Number(value)
    const safeValue = parsed === null || Number.isNaN(parsed) ? null : parsed
    setLocalField(inscricao.id, 'valorPrevisto', safeValue)
  }

  const handleMonthlySave = async (inscricao: Inscricao) => {
    if (!token) return
    const mode = getPaymentMode(inscricao)
    const normalized = ensureMonthlyPayments(inscricao.monthlyPayments)
    const totalMensalidades = sumMonthlyPayments(normalized)
    await updateField(inscricao.id, 'paymentMode', mode)
    await updateField(inscricao.id, 'monthlyPayments', normalized)
    if (mode === 'monthly') {
      await updateField(inscricao.id, 'valorPrevisto', inscricao.valorPrevisto ?? null)
      await updateField(inscricao.id, 'valorLiquidoFinal', totalMensalidades)
    } else {
      await updateField(inscricao.id, 'valorPrevisto', null)
    }
  }

  // TOGGLE (pago/grupoWhatsapp/remoto)
  const toggleField = async (
    id: string,
    current: boolean | null | undefined,
    field: 'pago' | 'grupoWhatsapp' | 'remoto'
  ) => {
    if (!token) return
    const nextValue = !(current === true)
    const bkey = keyBusy(id, field)

    setLocalField(id, field, nextValue)      // otimista
    if (field === 'remoto') recomputeAggregates()
    setBusy(s => ({ ...s, [bkey]: true }))
    setError(null)

    try {
      await axios.post(
        TOGGLE_ENDPOINT,
        { id, field },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      )
    } catch (err) {
      console.error(err)
      setError(`Falha ao alternar ${field}`)
      setLocalField(id, field, !nextValue)   // rollback
      if (field === 'remoto') recomputeAggregates()
    } finally {
      setBusy(s => {
        const { [bkey]: removed, ...rest } = s
        void removed
        return rest
      })
    }
  }

  // UPDATE (valorLiquidoFinal/observacoes)
  const updateField = async <K extends EditableField>(
    id: string,
    field: K,
    value: Inscricao[K]
  ) => {
    if (!token) return
    const bkey = keyBusy(id, field)
    const prev = getLocalFieldValue(id, field)

    setLocalField(id, field, value) // otimista
    if (field === 'valorLiquidoFinal') recomputeAggregates()
    setBusy(s => ({ ...s, [bkey]: true }))
    setError(null)

    try {
      await axios.post(
        UPDATE_ENDPOINT,
        { id, field, value },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      )
    } catch (err: unknown) {
      console.error(err)
      setError(`Falha ao atualizar ${field}`)
      setLocalField(id, field, prev) // rollback
      if (field === 'valorLiquidoFinal') recomputeAggregates()
    } finally {
      setBusy(s => {
        const { [bkey]: removed, ...rest } = s
        void removed
        return rest
      })
    }
  }

  const getLocalFieldValue = <K extends EditableField>(id: string, field: K): Inscricao[K] | null => {
    for (const group of Object.values(cursos)) {
      const found = group.inscricoes.find(i => i.id === id)
      if (found) {
        const value = found[field]
        return (value ?? null) as Inscricao[K] | null
      }
    }
    return null
  }

  const cursosParaRender =
    activeCurso === ALL_CURSO_KEY
      ? cursoEntries
      : cursoEntries.filter(([curso]) => curso === activeCurso)
  const waitlistCursosParaRender =
    activeWaitlistCurso === ALL_CURSO_KEY
      ? waitlistCursoEntries
      : waitlistCursoEntries.filter(([curso]) => curso === activeWaitlistCurso)
  const ultimaAtualizacaoLabel = lastUpdated ? lastUpdated.toLocaleString('pt-BR') : '—'
  const hasCursos = cursoEntries.length > 0
  const waitlistHasCursos = waitlistCursoEntries.length > 0
  const isRefreshing = loading || bebidasLoading
  const pedidosOrdenados = [...pedidosBebidas].sort((a, b) => {
    const da = new Date(a.criadoEm || 0).getTime()
    const db = new Date(b.criadoEm || 0).getTime()
    const base = (Number.isNaN(da) ? 0 : da) - (Number.isNaN(db) ? 0 : db)
    return pedidoSortAsc ? base : -base
  })
  const agendamentosOrdenados = [...agendamentosBebidas].sort((a, b) => {
    const da = new Date(a.criadoEm || 0).getTime()
    const db = new Date(b.criadoEm || 0).getTime()
    const base = (Number.isNaN(da) ? 0 : da) - (Number.isNaN(db) ? 0 : db)
    return agendamentoSortAsc ? base : -base
  })
  const faturamentoMensal = useMemo(() => {
    const mapa = new Map<string, number>()
    const add = (item: BebidaPedido | BebidaAgendamento) => {
      if ((item.status || '').toUpperCase() !== 'PAGO') return
      const base = item.confirmadoEm || item.criadoEm
      if (!base) return
      const dt = new Date(base)
      if (Number.isNaN(dt.getTime())) return
      const chave = dt.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      mapa.set(chave, (mapa.get(chave) || 0) + (item.total || 0))
    }
    pedidosBebidas.forEach(add)
    agendamentosBebidas.forEach(add)
    return Array.from(mapa.entries()).sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
  }, [pedidosBebidas, agendamentosBebidas])

  // Renderizar modal 2FA (precisa estar fora do if (!user) para não desaparecer após setUser)
  const render2FAModal = () => (
    <Modal show={show2FALogin} onHide={cancel2FALogin} centered backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>🔐 Autenticação de Dois Fatores</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="info">
          <strong>✉️ Código enviado!</strong>
          <br />
          Verifique seu email e insira o código de 6 dígitos abaixo.
          <br />
          <small className="text-muted">O código expira em 5 minutos.</small>
        </Alert>
        
        <Form.Group className="mb-3">
          <Form.Label>Código de Verificação</Form.Label>
          <Form.Control
            type="text"
            value={code2FALogin}
            onChange={e => setCode2FALogin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            style={{
              fontSize: '24px',
              textAlign: 'center',
              letterSpacing: '8px',
              fontWeight: 'bold'
            }}
            autoFocus
            disabled={loading}
          />
          <Form.Text className="text-muted">
            Digite apenas números (6 dígitos)
          </Form.Text>
        </Form.Group>

        {error && <Alert variant="danger">{error}</Alert>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={cancel2FALogin} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={verify2FALogin} 
          disabled={loading || code2FALogin.length !== 6}
        >
          {loading ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" />
              Verificando...
            </>
          ) : (
            'Verificar Código'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )

  if (!user || (user && !token)) {
    return (
      <>
        <div className="galaxy-login-container">
          <div className="galaxy-login-card">
            <div className="galaxy-logo" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div className="galaxy-logo-icon">🌌</div>
              <span className="galaxy-logo-text"><span>Galaxy</span></span>
            </div>
            <p className="subtitle"></p>
            <Form onSubmit={login}>
              <Form.Group className="mb-3">
                <Form.Label className="galaxy-form-label">Email</Form.Label>
                <Form.Control 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="seu@email.com"
                  required 
                  disabled={loading || sending2FALogin}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="galaxy-form-label">Senha</Form.Label>
                <Form.Control 
                  type="password" 
                  value={senha} 
                  onChange={e => setSenha(e.target.value)} 
                  placeholder="••••••••"
                  required 
                  disabled={loading || sending2FALogin}
                />
              </Form.Group>
              <button 
                type="submit" 
                className="galaxy-login-btn"
                disabled={loading || sending2FALogin}
              >
                {loading || sending2FALogin ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    {sending2FALogin ? 'Enviando código...' : 'Entrando...'}
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
              {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            </Form>
          </div>
        </div>

        {/* Modal 2FA */}
        {render2FAModal()}
      </>
    )
  }

  return (
    <div className="galaxy-admin-page">
      <Container fluid className="py-4">
        <div className="galaxy-header">
          <div className="galaxy-logo">
            <div className="galaxy-logo-icon">🌌</div>
            <span className="galaxy-logo-text"><span>Galaxy</span></span>
          </div>
          
          <div className="galaxy-nav-tabs">
            <button
              type="button"
              className={`galaxy-nav-tab ${activeView === 'inscricoes' ? 'active' : ''}`}
              onClick={() => setActiveView('inscricoes')}
            >
              <People /> <span>Inscrições</span>
            </button>
            <button
              type="button"
              className={`galaxy-nav-tab ${activeView === 'lista-espera' ? 'active' : ''}`}
              onClick={() => {
                setActiveView('lista-espera')
                if (token) {
                  void fetchWaitlist(token)
                }
              }}
            >
              <ClockHistory /> <span>Lista de Espera</span>
            </button>
            <button
              type="button"
              className={`galaxy-nav-tab ${activeView === 'calendario' ? 'active' : ''}`}
              onClick={() => setActiveView('calendario')}
            >
              <Calendar3 /> <span>Calendário</span>
            </button>
            <button
              type="button"
              className={`galaxy-nav-tab ${activeView === 'bebidas' ? 'active' : ''}`}
              onClick={() => setActiveView('bebidas')}
            >
              <Cup /> <span>Bebidas</span>
            </button>
            <button
              type="button"
              className={`galaxy-nav-tab ${activeView === 'cursos' ? 'active' : ''}`}
              onClick={() => setActiveView('cursos')}
            >
              <BookHalf /> <span>Cursos</span>
            </button>
          </div>

          <div className="galaxy-header-actions">
            <span className="text-muted small d-none d-md-inline" style={{ marginRight: '0.5rem' }}>
              Atualizado: {ultimaAtualizacaoLabel}
            </span>
            <button
              type="button"
              className="galaxy-btn-refresh"
              onClick={() => {
                if (activeView === 'lista-espera') {
                  if (token) {
                    void fetchWaitlist(token)
                  }
                  return
                }
                if (activeView === 'bebidas') {
                  if (token) {
                    void fetchBebidasAdmin(token)
                  }
                  return
                } else {
                  fetchInscricoes(token)
                }
              }}
              disabled={isRefreshing}
            >
              {isRefreshing ? <Spinner size="sm" animation="border" /> : <><ArrowClockwise /> Atualizar</>}
            </button>
            <button type="button" className="galaxy-btn-logout" onClick={logout}>
              <BoxArrowRight /> Sair
            </button>
          </div>
        </div>

      {activeView === 'inscricoes' && (
        <>
          <div className="galaxy-stats-grid">
            <div className="galaxy-stat-card stat-blue">
              <div className="galaxy-stat-header">
                <span className="galaxy-stat-label">Inscrições</span>
                <div className="galaxy-stat-icon"><People /></div>
              </div>
              <div className="galaxy-stat-value">{globalResumo.totalInscritos}</div>
            </div>
            <div className="galaxy-stat-card stat-cyan">
              <div className="galaxy-stat-header">
                <span className="galaxy-stat-label">Remoto</span>
                <div className="galaxy-stat-icon"><Laptop /></div>
              </div>
              <div className="galaxy-stat-value">{globalResumo.qtdeRemoto}</div>
            </div>
            <div className="galaxy-stat-card stat-green">
              <div className="galaxy-stat-header">
                <span className="galaxy-stat-label">Presencial</span>
                <div className="galaxy-stat-icon"><Building /></div>
              </div>
              <div className="galaxy-stat-value">{globalResumo.qtdePresencial}</div>
            </div>
            <div className="galaxy-stat-card stat-amber">
              <div className="galaxy-stat-header">
                <span className="galaxy-stat-label">Valor Líquido</span>
                <div className="galaxy-stat-icon"><CurrencyDollar /></div>
              </div>
              <div className="galaxy-stat-value currency">{money(globalResumo.totalValorLiquido)}</div>
            </div>
          </div>

          {hasCursos && (
            <div className="galaxy-chips-container">
              <div className="galaxy-chips-label">
                <ListUl /> Filtrar por curso
              </div>
              <div className="galaxy-chips-wrapper">
                <button
                  type="button"
                  onClick={() => setActiveCurso(ALL_CURSO_KEY)}
                  className={`galaxy-chip ${activeCurso === ALL_CURSO_KEY ? 'active' : ''}`}
                  role="tab"
                  aria-selected={activeCurso === ALL_CURSO_KEY}
                >
                  Todos
                  <span className="badge">{globalResumo.totalInscritos}</span>
                </button>
                {cursoEntries.map(([curso, group]) => {
                  const isActive = activeCurso === curso
                  return (
                    <button
                      key={curso}
                      type="button"
                      onClick={() => setActiveCurso(curso)}
                      className={`galaxy-chip ${isActive ? 'active' : ''}`}
                      title={curso}
                      role="tab"
                      aria-selected={isActive}
                    >
                      {curso}
                      <span className="badge">{group.totalInscritos}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          {cursosParaRender.map(([curso, group]) => (
            <div key={curso} className="galaxy-table-container mb-4">
              <div className="galaxy-table-header">
                <h4 className="galaxy-table-title">
                  {curso}
                </h4>
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <Badge bg="dark" pill>
                    Total: {group.totalInscritos}
                  </Badge>
                  <Badge bg="primary" pill>
                    Remoto: {group.qtdeRemoto}
                  </Badge>
                  <Badge bg="secondary" pill>
                    Presencial: {group.qtdePresencial}
                  </Badge>
                  <Badge bg="success" pill>
                    Líquido: {money(group.totalValorLiquido)}
                  </Badge>
                </div>
              </div>
              <div className="galaxy-cards-grid">
                {group.inscricoes.map(i => (
                  <InscricaoCard
                    key={i.id}
                    inscricao={i}
                    curso={curso}
                    busy={busy}
                    copiedPaymentId={copiedPaymentId}
                    money={money}
                    keyBusy={keyBusy}
                    buildWhatsappUrl={buildWhatsappUrl}
                    isFullstackCourse={isFullstackCourse}
                    getPaymentMode={getPaymentMode}
                    ensureMonthlyPayments={ensureMonthlyPayments}
                    sumMonthlyPayments={sumMonthlyPayments}
                    getLocalFieldValue={getLocalFieldValue}
                    setLocalField={setLocalField}
                    recomputeAggregates={recomputeAggregates}
                    toggleField={toggleField}
                    updateField={updateField}
                    handlePaymentModeChange={handlePaymentModeChange}
                    handleMonthlyStatusChange={handleMonthlyStatusChange}
                    handleMonthlyAmountChange={handleMonthlyAmountChange}
                    handleValorPrevistoChange={handleValorPrevistoChange}
                    handleMonthlySave={handleMonthlySave}
                    gerarContrato={gerarContrato}
                    copyPaymentLink={copyPaymentLink}
                    openAgendamentoModal={openAgendamentoModal}
                    formatDateTime={formatDateTime}
                    deletar={deletar}
                    ASAAS_STATUS_LABELS={ASAAS_STATUS_LABELS}
                    ASAAS_STATUS_VARIANTS={ASAAS_STATUS_VARIANTS}
                  />
                ))}
              </div>
          </div>
          ))}

          {!hasCursos && !loading && (
            <Alert variant="info">Nenhuma inscrição encontrada.</Alert>
          )}

          {loading && (
            <div className="d-flex justify-content-center">
              <Spinner animation="border" />
            </div>
          )}

          <Modal show={agendamentoModalOpen} onHide={() => setAgendamentoModalOpen(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Agendamento de pagamento</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {agendamentoInscricao && (
                <div className="small text-muted mb-3">
                  {agendamentoInscricao.nomeCompleto} — {agendamentoInscricao.curso}
                </div>
              )}
              <Form.Group>
                <Form.Label>Data do pagamento</Form.Label>
                <Form.Control
                  type="date"
                  value={agendamentoDate}
                  onChange={e => setAgendamentoDate(e.target.value)}
                  disabled={agendamentoBusy}
                />
                <Form.Text className="text-muted">
                  O lembrete automático (5 dias antes e no dia) é enviado para o admin. Para o aluno, use o botão
                  abaixo.
                </Form.Text>
              </Form.Group>
              {agendamentoSuccess && (
                <Alert variant="success" className="mt-3 mb-0">
                  {agendamentoSuccess}
                </Alert>
              )}
              {agendamentoError && (
                <Alert variant="danger" className="mt-3 mb-0">
                  {agendamentoError}
                </Alert>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="outline-secondary"
                onClick={() => void sendAgendamentoReminderToAluno()}
                disabled={agendamentoBusy || !agendamentoInscricao}
              >
                Enviar lembrete ao aluno
              </Button>
              <Button
                variant="outline-danger"
                onClick={() => void cancelAgendamento()}
                disabled={agendamentoBusy || !agendamentoInscricao}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() => void saveAgendamento()}
                disabled={agendamentoBusy || !agendamentoInscricao || !agendamentoDate}
              >
                {agendamentoBusy ? <Spinner size="sm" animation="border" /> : 'Salvar'}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}

      {activeView === 'lista-espera' && (
        <>
          {waitlistHasCursos && (
            <div className="galaxy-chips-container">
              <div className="galaxy-chips-label">
                <ListUl /> Filtrar por curso
              </div>
              <div className="galaxy-chips-wrapper">
                <button
                  type="button"
                  onClick={() => setActiveWaitlistCurso(ALL_CURSO_KEY)}
                  className={`galaxy-chip ${activeWaitlistCurso === ALL_CURSO_KEY ? 'active' : ''}`}
                  role="tab"
                  aria-selected={activeWaitlistCurso === ALL_CURSO_KEY}
                >
                  Todos
                  <span className="badge">{waitlistResumo.total}</span>
                </button>
                {waitlistCursoEntries.map(([curso, group]) => {
                  const isActive = activeWaitlistCurso === curso
                  return (
                    <button
                      key={curso}
                      type="button"
                      onClick={() => setActiveWaitlistCurso(curso)}
                      className={`galaxy-chip ${isActive ? 'active' : ''}`}
                      title={curso}
                      role="tab"
                      aria-selected={isActive}
                    >
                      {curso}
                      <span className="badge">{group.total}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          {waitlistCursosParaRender.map(([curso, group]) => (
            <div key={curso} className="galaxy-table-container mb-4">
              <div className="galaxy-table-header">
                <h4 className="galaxy-table-title">
                  {curso}
                </h4>
                <Badge bg="dark" pill>
                  Total na lista de espera: {group.total}
                </Badge>
              </div>
              <div className="galaxy-cards-grid">
                {group.itens.map(item => (
                  <WaitlistCard
                    key={item.id || `${curso}-${item.email}-${item.criadoEm}`}
                    item={item}
                    curso={curso}
                  />
                ))}
              </div>
            </div>
          ))}

          {!waitlistHasCursos && !loading && (
            <Alert variant="info">Nenhuma pessoa na lista de espera.</Alert>
          )}

          {loading && (
            <div className="d-flex justify-content-center">
              <Spinner animation="border" />
            </div>
          )}
        </>
      )}

      {activeView === 'bebidas' && (
        <>
          <Row className="g-4 mb-4">
            <Col xs={12} lg={5}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title className="mb-3">
                    {bebidaForm.id ? 'Editar bebida' : 'Nova bebida'}
                  </Card.Title>
                  {bebidasError && <Alert variant="danger">{bebidasError}</Alert>}
                  <Form onSubmit={submitBebidaForm}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nome</Form.Label>
                      <Form.Control
                        value={bebidaForm.nome}
                        onChange={e => setBebidaForm(prev => ({ ...prev, nome: e.target.value }))}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Imagem</Form.Label>
                      <div
                        tabIndex={0}
                        onPaste={handleBebidaPaste}
                        onKeyDown={e => {
                          if (e.key === 'Enter') e.currentTarget.focus()
                        }}
                        style={{
                          border: '1px dashed #ced4da',
                          borderRadius: 8,
                          padding: '12px 14px',
                          marginBottom: 12,
                          outline: 'none'
                        }}
                      >
                        Cole a imagem aqui (Ctrl + V) ou selecione um arquivo
                      </div>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleBebidaFileChange}
                        disabled={bebidaImageUploading}
                      />
                      <Form.Text className="text-muted">
                        Envie a imagem antes de salvar. O link será associado à bebida.
                      </Form.Text>
                      {bebidaImageUploading && (
                        <div className="mt-2">
                          <Spinner size="sm" animation="border" /> Enviando imagem...
                        </div>
                      )}
                      {bebidaForm.imagemUrl && (
                        <div className="mt-3">
                          <img
                            src={bebidaImagePreview || bebidaForm.imagemUrl}
                            alt="Preview bebida"
                            style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 8 }}
                            onError={e => {
                              const img = e.currentTarget
                              img.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                    </Form.Group>
                    <Row className="g-2">
                      <Col xs={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Preço</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            min="0"
                            value={bebidaForm.preco}
                            onChange={e => setBebidaForm(prev => ({ ...prev, preco: e.target.value }))}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Estoque</Form.Label>
                          <Form.Control
                            type="number"
                            min="0"
                            value={bebidaForm.estoqueAtual}
                            onChange={e => setBebidaForm(prev => ({ ...prev, estoqueAtual: e.target.value }))}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Check
                      type="switch"
                      id="bebida-ativa"
                      label="Bebida ativa"
                      checked={bebidaForm.ativo}
                      onChange={e => setBebidaForm(prev => ({ ...prev, ativo: e.target.checked }))}
                      className="mb-3"
                    />
                    <div className="d-flex gap-2">
                      <Button type="submit" disabled={bebidasLoading || bebidaImageUploading}>
                        {bebidaForm.id ? 'Atualizar' : 'Cadastrar'}
                      </Button>
                      <Button variant="outline-secondary" onClick={resetBebidaForm}>
                        Limpar
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} lg={7}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title className="mb-3">Bebidas cadastradas</Card.Title>
                  {bebidasLoading && (
                    <div className="text-center py-4">
                      <Spinner animation="border" />
                    </div>
                  )}
                  {!bebidasLoading && bebidas.length === 0 && (
                    <Alert variant="info" className="mb-0">
                      Nenhuma bebida cadastrada.
                    </Alert>
                  )}
                  {!bebidasLoading && bebidas.length > 0 && (
                    <div style={{ maxHeight: 420, overflow: 'auto' }}>
                      <Table striped bordered hover size="sm" className="align-middle">
                        <thead>
                          <tr>
                            <th>Imagem</th>
                            <th>Nome</th>
                            <th>Preço</th>
                            <th>Estoque</th>
                            <th>Status</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bebidas.map(bebida => (
                            <tr key={bebida.id}>
                              <td>
                                {bebida.imagemUrlSigned || bebida.imagemUrl ? (
                                  <img
                                    src={bebida.imagemUrlSigned || bebida.imagemUrl || undefined}
                                    alt={bebida.nome}
                                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }}
                                    onError={e => {
                                      const img = e.currentTarget
                                      img.style.display = 'none'
                                    }}
                                  />
                                ) : (
                                  <span className="text-muted small">—</span>
                                )}
                              </td>
                              <td>{bebida.nome}</td>
                              <td>{money(bebida.preco)}</td>
                              <td>{bebida.estoqueAtual}</td>
                              <td>
                                <Badge bg={bebida.ativo ? 'success' : 'secondary'}>
                                  {bebida.ativo ? 'Ativa' : 'Inativa'}
                                </Badge>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => editBebida(bebida)}
                                  >
                                    Editar
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => deleteBebida(bebida.id)}
                                  >
                                    Remover
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4">
            <Col xs={12} lg={6}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title className="mb-3">Pedidos (todos)</Card.Title>
                  {pedidosBebidas.length === 0 && (
                    <Alert variant="light" className="mb-0">
                      Nenhum pedido registrado.
                    </Alert>
                  )}
                  {pedidosBebidas.length > 0 && (
                    <Table striped bordered hover size="sm" className="align-middle">
                      <thead>
                        <tr>
                          <th>Aluno</th>
                          <th>Itens</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Confirmado em</th>
                          <th>
                            <button
                              type="button"
                              onClick={() => setPedidoSortAsc(prev => !prev)}
                              style={{ background: 'none', border: 'none', padding: 0 }}
                            >
                              Criado em {pedidoSortAsc ? '▲' : '▼'}
                            </button>
                          </th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pedidosOrdenados.map(pedido => (
                          <tr key={pedido.id}>
                            <td>{pedido.usuarioNome || '—'}</td>
                            <td style={{ minWidth: 220 }}>{formatBebidasItens(pedido.itens)}</td>
                            <td>{money(pedido.total)}</td>
                            <td>{pedido.status || '—'}</td>
                            <td>{formatBrDateTime(pedido.confirmadoEm)}</td>
                            <td>{formatBrDateTime(pedido.criadoEm)}</td>
                            <td>
                              <div className="d-flex flex-column gap-2">
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => confirmarPagamentoBebida(pedido.id, 'pedido')}
                                  disabled={(pedido.status || '').toUpperCase() === 'PAGO'}
                                >
                                  Confirmar pagamento
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => excluirRegistroBebida(pedido.id, 'pedido')}
                                >
                                  Excluir
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} lg={6}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title className="mb-3">Agendamentos (todos)</Card.Title>
                  {agendamentosBebidas.length === 0 && (
                    <Alert variant="light" className="mb-0">
                      Nenhum agendamento registrado.
                    </Alert>
                  )}
                  {agendamentosBebidas.length > 0 && (
                    <Table striped bordered hover size="sm" className="align-middle">
                      <thead>
                        <tr>
                          <th>Aluno</th>
                          <th>Itens</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Confirmado em</th>
                          <th>
                            <button
                              type="button"
                              onClick={() => setAgendamentoSortAsc(prev => !prev)}
                              style={{ background: 'none', border: 'none', padding: 0 }}
                            >
                              Criado em {agendamentoSortAsc ? '▲' : '▼'}
                            </button>
                          </th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agendamentosOrdenados.map(agendamento => (
                          <tr key={agendamento.id}>
                            <td>{agendamento.usuarioNome || '—'}</td>
                            <td style={{ minWidth: 220 }}>{formatBebidasItens(agendamento.itens)}</td>
                            <td>{money(agendamento.total)}</td>
                            <td>{agendamento.status || '—'}</td>
                            <td>{formatBrDateTime(agendamento.confirmadoEm)}</td>
                            <td>{formatBrDateTime(agendamento.criadoEm)}</td>
                            <td>
                              <div className="d-flex flex-column gap-2">
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => confirmarPagamentoBebida(agendamento.id, 'agendamento')}
                                  disabled={(agendamento.status || '').toUpperCase() === 'PAGO'}
                                >
                                  Confirmar pagamento
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => excluirRegistroBebida(agendamento.id, 'agendamento')}
                                >
                                  Excluir
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="g-4 mt-1">
            <Col xs={12}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title className="mb-3">Faturamento por mês</Card.Title>
                  {faturamentoMensal.length === 0 && (
                    <Alert variant="light" className="mb-0">
                      Nenhum faturamento confirmado.
                    </Alert>
                  )}
                  {faturamentoMensal.length > 0 && (
                    <Table striped bordered hover size="sm" className="align-middle">
                      <thead>
                        <tr>
                          <th>Mês</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {faturamentoMensal.map(([mes, total]) => (
                          <tr key={mes}>
                            <td>{mes}</td>
                            <td>{money(total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {activeView === 'cursos' && user && token && (
        <GalaxyCourseManager token={token} adminEmail={user.email || ''} />
      )}

      {activeView === 'calendario' && (
        <GalaxyCalendar apiBase={API_BASE} token={token} />
      )}
    </Container>
    </div>
  )
}
