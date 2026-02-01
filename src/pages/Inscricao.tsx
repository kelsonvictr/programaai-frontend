// src/pages/Inscricao.tsx

import React, { useState, useEffect, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Container, Form, Button, Alert, Modal, ProgressBar } from "react-bootstrap"
import axios from "axios"
import { termosDoCurso } from "../mocks/terms"
import ParcelamentoModal from "../components/ParcelamentoModal"
import { 
  FaWhatsapp, FaUser, FaMapMarkerAlt, FaGraduationCap, 
  FaCheckCircle, FaArrowRight, FaArrowLeft, FaTag,
  FaCreditCard, FaLock, FaShieldAlt
} from "react-icons/fa"
import { BsPersonBadge, BsEnvelope, BsPhone, BsCalendar, BsHouseDoor } from "react-icons/bs"
import "./Inscricao.css"

type FormControlElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

interface FormState {
  nome: string
  cpf: string
  rg: string
  dataNascimento: string
  celular: string
  email: string
  emailConfirm: string
  sexo: string
  estadoCivil: string
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  fonteAI: string
  amigoIndicacao: string
  fonteCurso: string
  fonteCursoOutro: string
  estudanteTI: string
  estudanteDetalhe: string
  aceitaTermos: boolean
  website: string
}

interface Course {
  id: string
  title: string
  description: string
  duration: string
  price: string
  obsPrice?: string
  imageUrl: string
  bannerSite: string
  bannerMobile: string
  professor: string
  profFoto: string
  linkedin: string
  datas: string[]
  horario: string
  modalidade: string
  bio: string
  prerequisitos?: string[]
  publicoAlvo?: string[]
  oQueVaiAprender?: string[]
  modulos?: string[]
}

const STEPS = [
  { id: 1, title: "Dados Pessoais", icon: FaUser, description: "Suas informações básicas" },
  { id: 2, title: "Endereço", icon: FaMapMarkerAlt, description: "Onde você mora" },
  { id: 3, title: "Formação", icon: FaGraduationCap, description: "Sua experiência" },
  { id: 4, title: "Finalizar", icon: FaCheckCircle, description: "Revisão e confirmação" }
]

const Inscricao: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(1)
  const [stepErrors, setStepErrors] = useState<Record<number, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState<FormState>({
    nome: "",
    cpf: "",
    rg: "",
    dataNascimento: "",
    celular: "+55 ",
    email: "",
    emailConfirm: "",
    sexo: "",
    estadoCivil: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    fonteAI: "",
    amigoIndicacao: "",
    fonteCurso: "",
    fonteCursoOutro: "",
    estudanteTI: "",
    estudanteDetalhe: "",
    aceitaTermos: false,
    website: "",
  })

  const [showAIAmigo, setShowAIAmigo] = useState(false)
  const [showCursoOutro, setShowCursoOutro] = useState(false)
  const [showEstudanteDetalhe, setShowEstudanteDetalhe] = useState(false)
  const [showTermos, setShowTermos] = useState(false)
  const [showParcelamento, setShowParcelamento] = useState(false)
  const [loadingCep, setLoadingCep] = useState(false)
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  const [cupom, setCupom] = useState<string>("")
  const [validCupom, setValidCupom] = useState<boolean | null>(null)
  const [desconto, setDesconto] = useState<number>(0)
  const [valorFinal, setValorFinal] = useState<number>(0)
  const [checkingCupom, setCheckingCupom] = useState(false)

  useEffect(() => {
    if (!id) {
      navigate("/")
      return
    }
    axios
      .get<Course | Course[]>(`${import.meta.env.VITE_API_URL}/cursos`, { params: { id } })
      .then(resp => {
        const data = resp.data
        const curso = Array.isArray(data) ? data[0] : data
        if (!curso) {
          navigate("/")
        } else {
          setCourse(curso)
        }
      })
      .catch(() => navigate("/"))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const maskCpf = (v: string) =>
    v.replace(/\D/g, "").slice(0, 11)
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3}\.\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3}\.\d{3}\.\d{3})(\d)/, "$1-$2")

  const maskDate = (v: string) =>
    v.replace(/\D/g, "").slice(0, 8)
      .replace(/^(\d{2})(\d)/, "$1/$2")
      .replace(/^(\d{2}\/\d{2})(\d)/, "$1/$2")

  const maskCel = (v: string) => {
    let raw = v.replace(/\D/g, "")
    if (!raw.startsWith("55")) raw = "55" + raw
    raw = raw.slice(0, 13)
    return "+" + raw.slice(0, 2) +
      (raw.length > 2 ? " (" + raw.slice(2, 4) + ")" : "") +
      (raw.length >= 4 ? " " + raw.slice(4, 9) : "") +
      (raw.length >= 9 ? "-" + raw.slice(9, 13) : "")
  }

  const maskCep = (v: string) =>
    v.replace(/\D/g, "").slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2")

  const handleChange: React.ChangeEventHandler<FormControlElement> = e => {
    const { name, type, value } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }))

    if (name === "fonteAI") {
      const isAmigo = value === "Recomendação de amigos"
      setShowAIAmigo(isAmigo)
      if (!isAmigo) setForm(f => ({ ...f, amigoIndicacao: "" }))
    }
    if (name === "fonteCurso") {
      const isOutro = value === "Outros"
      setShowCursoOutro(isOutro)
      if (!isOutro) setForm(f => ({ ...f, fonteCursoOutro: "" }))
    }
    if (name === "estudanteTI") {
      const precisaDetalhar = value !== "Não"
      setShowEstudanteDetalhe(precisaDetalhar)
      if (!precisaDetalhar) setForm(f => ({ ...f, estudanteDetalhe: "" }))
    }
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, cpf: maskCpf(e.target.value) }))
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, dataNascimento: maskDate(e.target.value) }))
  
  const handleCelChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, celular: maskCel(e.target.value) }))

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cepMasked = maskCep(e.target.value)
    setForm(f => ({ ...f, cep: cepMasked }))

    const cepClean = cepMasked.replace(/\D/g, "")
    if (cepClean.length === 8) {
      setLoadingCep(true)
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cepClean}/json/`)
        if (response.data && !response.data.erro) {
          setForm(f => ({
            ...f,
            logradouro: response.data.logradouro || "",
            bairro: response.data.bairro || "",
            cidade: response.data.localidade || "",
            estado: response.data.uf || ""
          }))
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error)
      } finally {
        setLoadingCep(false)
      }
    }
  }

  const validateStep = (step: number): string[] => {
    const errs: string[] = []
    
    if (step === 1) {
      if (!form.nome.trim()) errs.push("Nome completo é obrigatório")
      if (!/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(form.cpf)) errs.push("CPF inválido")
      if (!form.rg.trim()) errs.push("RG é obrigatório")
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(form.dataNascimento)) errs.push("Data de nascimento inválida")
      if (!/^\+\d{2}\s\(\d{2}\)\s\d{5}\-\d{4}$/.test(form.celular)) errs.push("Celular inválido")
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.push("E-mail inválido")
      if (form.email !== form.emailConfirm) errs.push("E-mails não conferem")
      if (!form.sexo) errs.push("Selecione seu sexo")
      if (!form.estadoCivil) errs.push("Selecione seu estado civil")
    }
    
    if (step === 2) {
      if (!/^\d{5}\-\d{3}$/.test(form.cep)) errs.push("CEP inválido")
      if (!form.logradouro.trim()) errs.push("Logradouro é obrigatório")
      if (!form.numero.trim()) errs.push("Número é obrigatório")
      if (!form.bairro.trim()) errs.push("Bairro é obrigatório")
      if (!form.cidade.trim()) errs.push("Cidade é obrigatória")
      if (!form.estado.trim() || form.estado.length !== 2) errs.push("UF inválida")
    }
    
    if (step === 3) {
      if (!form.fonteAI) errs.push("Informe como conheceu a Programa AI")
      if (form.fonteAI === "Recomendação de amigos" && !form.amigoIndicacao.trim())
        errs.push("Informe o nome do amigo")
      if (!form.fonteCurso) errs.push("Informe como conheceu este curso")
      if (form.fonteCurso === "Outros" && !form.fonteCursoOutro.trim())
        errs.push("Detalhe como conheceu o curso")
      if (!form.estudanteTI) errs.push("Informe se é estudante de TI")
      if (form.estudanteTI !== "Não" && !form.estudanteDetalhe.trim())
        errs.push("Informe onde estuda/estudou")
    }
    
    if (step === 4) {
      if (!form.aceitaTermos) errs.push("Você precisa concordar com os termos")
      if (form.website.trim() !== "") errs.push("Submissão bloqueada")
    }
    
    return errs
  }

  const handleNext = () => {
    const errs = validateStep(currentStep)
    if (errs.length > 0) {
      setStepErrors(prev => ({ ...prev, [currentStep]: errs }))
      return
    }
    setStepErrors(prev => ({ ...prev, [currentStep]: [] }))
    setCurrentStep(prev => Math.min(prev + 1, 4))
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validateStep(4)
    if (errs.length > 0) {
      setStepErrors(prev => ({ ...prev, 4: errs }))
      return
    }
    
    setIsSubmitting(true)
    try {
      const resp = await axios.post(`${import.meta.env.VITE_API_URL}/inscricao`, {
        nomeCompleto: form.nome,
        cpf: form.cpf,
        rg: form.rg,
        email: form.email,
        whatsapp: form.celular.replace(/\D/g, ""),
        sexo: form.sexo,
        estadoCivil: form.estadoCivil,
        dataNascimento: form.dataNascimento.split("/").reverse().join("-"),
        cep: form.cep.replace(/\D/g, ""),
        logradouro: form.logradouro,
        numero: form.numero,
        complemento: form.complemento,
        bairro: form.bairro,
        cidade: form.cidade,
        estado: form.estado.toUpperCase(),
        formacaoTI: form.estudanteTI,
        ondeEstuda: form.estudanteDetalhe,
        comoSoube: form.fonteAI === "Outros" ? form.fonteCursoOutro
          : form.fonteAI === "Recomendação de amigos" ? `Indicação de ${form.amigoIndicacao}`
          : form.fonteAI,
        nomeAmigo: form.amigoIndicacao || "",
        curso: course!.title,
        aceitouTermos: form.aceitaTermos,
        versaoTermo: "v1.0",
        cupom: cupom || undefined
      })
      
      const isFullstack = course!.title.includes("Curso Presencial Programação Fullstack")
      navigate(`/pagamento/${resp.data.inscricao_id}${isFullstack ? "?isFullstack=true" : ""}`)
    } catch {
      setStepErrors(prev => ({ ...prev, 4: ["Erro ao enviar sua inscrição. Tente novamente."] }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const checkCupom = async () => {
    if (!cupom.trim() || !course) return
    setCheckingCupom(true)
    try {
      const resp = await axios.get(`${import.meta.env.VITE_API_URL}/checa-cupom`, {
        params: { cupom, curso: course.title }
      })
      if (resp.data.valid) {
        const descontoRaw = resp.data.desconto as string
        let d = 0
        const base = parseFloat(course.price.replace("R$", "").replace(",", "."))
        if (descontoRaw.endsWith("%")) {
          d = base * (parseFloat(descontoRaw) / 100)
        } else {
          d = parseFloat(descontoRaw.replace("R$", "").replace(",", "."))
        }
        setDesconto(d)
        setValorFinal(Math.max(0, base - d))
        setValidCupom(true)
      } else {
        setValidCupom(false)
      }
    } catch {
      setValidCupom(false)
    } finally {
      setCheckingCupom(false)
    }
  }

  const valorBase = useMemo(() => 
    course ? parseFloat(course.price.replace("R$", "").replace(",", ".")) : 0,
    [course]
  )
  const valorDesconto = validCupom ? valorFinal : valorBase
  const valorCartao = +(valorDesconto * 1.08).toFixed(2)
  const parcela12 = +(valorCartao / 12).toFixed(2)

  const progress = (currentStep / 4) * 100

  if (loading) {
    return (
      <div className="inscricao-loading">
        <div className="inscricao-loading-spinner" />
        <p>Carregando informações do curso...</p>
      </div>
    )
  }

  if (!course) return null

  const isFieldValid = (fieldName: string): boolean | null => {
    const value = form[fieldName as keyof FormState]
    if (!value || (typeof value === 'string' && !value.trim())) return null
    
    switch (fieldName) {
      case 'cpf': return /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(value as string)
      case 'email': return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string)
      case 'emailConfirm': return form.email === form.emailConfirm
      case 'celular': return /^\+\d{2}\s\(\d{2}\)\s\d{5}\-\d{4}$/.test(value as string)
      case 'dataNascimento': return /^\d{2}\/\d{2}\/\d{4}$/.test(value as string)
      case 'cep': return /^\d{5}\-\d{3}$/.test(value as string)
      case 'estado': return (value as string).length === 2
      default: return (typeof value === 'string' && value.trim().length > 0) || value === true
    }
  }

  const getFieldClass = (fieldName: string): string => {
    const valid = isFieldValid(fieldName)
    if (valid === null) return ''
    return valid ? 'field-valid' : 'field-invalid'
  }

  return (
    <div className="inscricao-page">
      {/* Hero Section */}
      <div className="inscricao-hero">
        <div className="inscricao-hero-overlay" />
        <Container>
          <div className="inscricao-hero-content">
            <span className="inscricao-badge">
              <FaShieldAlt /> Inscrição Segura
            </span>
            <h1>{course.title}</h1>
            <p className="inscricao-hero-subtitle">
              Complete sua inscrição em apenas 4 passos simples
            </p>
          </div>
        </Container>
      </div>

      <Container className="inscricao-container">
        {/* Sidebar com resumo */}
        <aside className="inscricao-sidebar">
          <div className="inscricao-sidebar-card">
            <div className="inscricao-sidebar-header">
              <h3>Resumo do Curso</h3>
            </div>
            <div className="inscricao-sidebar-body">
              <div className="inscricao-course-img">
                <img src={course.imageUrl} alt={course.title} />
              </div>
              <h4>{course.title}</h4>
              <div className="inscricao-course-meta">
                <span>📅 {course.duration}</span>
                <span>📍 {course.modalidade}</span>
              </div>
              
              <div className="inscricao-price-section">
                <div className="inscricao-price-label">Investimento</div>
                <div className="inscricao-price-value">
                  {validCupom ? (
                    <>
                      <span className="inscricao-price-old">{course.price}</span>
                      <span className="inscricao-price-new">
                        R$ {valorDesconto.toFixed(2).replace(".", ",")}
                      </span>
                    </>
                  ) : (
                    <span>{course.price}</span>
                  )}
                </div>
                <div className="inscricao-price-options">
                  <div className="inscricao-price-option">
                    <span className="option-label">PIX à vista</span>
                    <span className="option-value">R$ {valorDesconto.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="inscricao-price-option">
                    <span className="option-label">Cartão 12x</span>
                    <span className="option-value">R$ {parcela12.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>
                <button 
                  className="inscricao-link-parcelamento"
                  onClick={() => setShowParcelamento(true)}
                >
                  <FaCreditCard /> Ver todas opções de parcelamento
                </button>
              </div>

              {validCupom && (
                <div className="inscricao-cupom-applied">
                  <FaTag /> Cupom aplicado: <strong>{cupom}</strong>
                  <br />
                  <small>Economia de R$ {desconto.toFixed(2).replace(".", ",")}</small>
                </div>
              )}

              <a
                href={`https://wa.me/5583986608771?text=${encodeURIComponent(
                  `Oi prof. Kelson, estou na página de inscrição do ${course.title} e gostaria de tirar algumas dúvidas.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inscricao-whatsapp-btn"
              >
                <FaWhatsapp /> Dúvidas? Fale conosco
              </a>
            </div>
          </div>

          <div className="inscricao-trust-badges">
            <div className="trust-badge">
              <FaLock />
              <span>Dados protegidos</span>
            </div>
            <div className="trust-badge">
              <FaShieldAlt />
              <span>Pagamento seguro</span>
            </div>
          </div>
        </aside>

        {/* Main Form */}
        <main className="inscricao-main">
          {/* Progress Steps */}
          <div className="inscricao-steps">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              const hasError = (stepErrors[step.id] || []).length > 0

              return (
                <React.Fragment key={step.id}>
                  <div 
                    className={`inscricao-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${hasError ? 'has-error' : ''}`}
                    onClick={() => isCompleted && setCurrentStep(step.id)}
                  >
                    <div className="step-icon">
                      {isCompleted ? <FaCheckCircle /> : <StepIcon />}
                    </div>
                    <div className="step-info">
                      <span className="step-title">{step.title}</span>
                      <span className="step-desc">{step.description}</span>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && <div className="step-connector" />}
                </React.Fragment>
              )
            })}
          </div>

          <ProgressBar now={progress} className="inscricao-progress" />

          {/* Form Card */}
          <div className="inscricao-form-card">
            <Form noValidate onSubmit={handleSubmit}>
              {/* Step 1: Dados Pessoais */}
              {currentStep === 1 && (
                <div className="inscricao-step-content animate-fade-in">
                  <div className="step-header">
                    <h2><FaUser /> Dados Pessoais</h2>
                    <p>Preencha suas informações básicas para começarmos</p>
                  </div>

                  <div className="form-grid">
                    <Form.Group className="form-group full-width">
                      <Form.Label><BsPersonBadge /> Nome completo</Form.Label>
                      <Form.Control
                        name="nome"
                        value={form.nome}
                        onChange={handleChange}
                        placeholder="Digite seu nome completo"
                        className={getFieldClass('nome')}
                      />
                    </Form.Group>

                    <Form.Group className="form-group">
                      <Form.Label><BsPersonBadge /> CPF</Form.Label>
                      <Form.Control
                        name="cpf"
                        value={form.cpf}
                        onChange={handleCpfChange}
                        placeholder="000.000.000-00"
                        className={getFieldClass('cpf')}
                      />
                    </Form.Group>

                    <Form.Group className="form-group">
                      <Form.Label><BsPersonBadge /> RG</Form.Label>
                      <Form.Control
                        name="rg"
                        value={form.rg}
                        onChange={handleChange}
                        placeholder="Digite seu RG"
                        className={getFieldClass('rg')}
                      />
                    </Form.Group>

                    <Form.Group className="form-group">
                      <Form.Label><BsCalendar /> Data de Nascimento</Form.Label>
                      <Form.Control
                        name="dataNascimento"
                        value={form.dataNascimento}
                        onChange={handleDateChange}
                        placeholder="DD/MM/AAAA"
                        className={getFieldClass('dataNascimento')}
                      />
                    </Form.Group>

                    <Form.Group className="form-group">
                      <Form.Label><BsPhone /> Celular / WhatsApp</Form.Label>
                      <Form.Control
                        name="celular"
                        value={form.celular}
                        onChange={handleCelChange}
                        placeholder="+55 (00) 00000-0000"
                        className={getFieldClass('celular')}
                      />
                    </Form.Group>

                    <Form.Group className="form-group">
                      <Form.Label><BsEnvelope /> E-mail</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="seu@email.com"
                        className={getFieldClass('email')}
                      />
                    </Form.Group>

                    <Form.Group className="form-group">
                      <Form.Label><BsEnvelope /> Confirme o E-mail</Form.Label>
                      <Form.Control
                        type="email"
                        name="emailConfirm"
                        value={form.emailConfirm}
                        onChange={handleChange}
                        placeholder="Confirme seu e-mail"
                        className={getFieldClass('emailConfirm')}
                      />
                      {form.emailConfirm && form.email !== form.emailConfirm && (
                        <Form.Text className="text-danger">Os e-mails não conferem</Form.Text>
                      )}
                    </Form.Group>

                    <Form.Group className="form-group">
                      <Form.Label>Sexo</Form.Label>
                      <Form.Select name="sexo" value={form.sexo} onChange={handleChange} className={getFieldClass('sexo')}>
                        <option value="">Selecione...</option>
                        <option>Masculino</option>
                        <option>Feminino</option>
                        <option>Não-binário</option>
                        <option>Prefiro não dizer</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="form-group">
                      <Form.Label>Estado Civil</Form.Label>
                      <Form.Select name="estadoCivil" value={form.estadoCivil} onChange={handleChange} className={getFieldClass('estadoCivil')}>
                        <option value="">Selecione...</option>
                        <option>Solteiro(a)</option>
                        <option>Casado(a)</option>
                        <option>Divorciado(a)</option>
                        <option>Viúvo(a)</option>
                        <option>União estável</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                </div>
              )}

              {/* Step 2: Endereço */}
              {currentStep === 2 && (
                <div className="inscricao-step-content animate-fade-in">
                  <div className="step-header">
                    <h2><FaMapMarkerAlt /> Endereço</h2>
                    <p>Digite seu CEP para preenchimento automático</p>
                  </div>

                  <div className="form-grid">
                    <Form.Group className="form-group cep-group">
                      <Form.Label><BsHouseDoor /> CEP</Form.Label>
                      <div className="cep-input-wrapper">
                        <Form.Control
                          name="cep"
                          value={form.cep}
                          onChange={handleCepChange}
                          placeholder="00000-000"
                          className={getFieldClass('cep')}
                        />
                        {loadingCep && (
                          <div className="cep-loading">
                            <div className="spinner-border spinner-border-sm" />
                          </div>
                        )}
                      </div>
                      {loadingCep && <Form.Text className="text-info">🔍 Buscando endereço...</Form.Text>}
                    </Form.Group>

                    <Form.Group className="form-group full-width">
                      <Form.Label>Logradouro</Form.Label>
                      <Form.Control
                        name="logradouro"
                        value={form.logradouro}
                        onChange={handleChange}
                        placeholder="Rua, Avenida, etc."
                        className={getFieldClass('logradouro')}
                      />
                    </Form.Group>

                    <Form.Group className="form-group small-field">
                      <Form.Label>Número</Form.Label>
                      <Form.Control
                        name="numero"
                        value={form.numero}
                        onChange={handleChange}
                        placeholder="123"
                        className={getFieldClass('numero')}
                      />
                    </Form.Group>

                    <Form.Group className="form-group">
                      <Form.Label>Complemento</Form.Label>
                      <Form.Control
                        name="complemento"
                        value={form.complemento}
                        onChange={handleChange}
                        placeholder="Apto, Bloco (opcional)"
                      />
                    </Form.Group>

                    <Form.Group className="form-group">
                      <Form.Label>Bairro</Form.Label>
                      <Form.Control
                        name="bairro"
                        value={form.bairro}
                        onChange={handleChange}
                        placeholder="Nome do bairro"
                        className={getFieldClass('bairro')}
                      />
                    </Form.Group>

                    <Form.Group className="form-group">
                      <Form.Label>Cidade</Form.Label>
                      <Form.Control
                        name="cidade"
                        value={form.cidade}
                        onChange={handleChange}
                        placeholder="Nome da cidade"
                        className={getFieldClass('cidade')}
                      />
                    </Form.Group>

                    <Form.Group className="form-group small-field">
                      <Form.Label>UF</Form.Label>
                      <Form.Control
                        name="estado"
                        value={form.estado}
                        onChange={handleChange}
                        placeholder="UF"
                        maxLength={2}
                        className={getFieldClass('estado')}
                        style={{ textTransform: 'uppercase' }}
                      />
                    </Form.Group>
                  </div>
                </div>
              )}

              {/* Step 3: Formação */}
              {currentStep === 3 && (
                <div className="inscricao-step-content animate-fade-in">
                  <div className="step-header">
                    <h2><FaGraduationCap /> Sua Formação</h2>
                    <p>Conte-nos um pouco sobre sua experiência</p>
                  </div>

                  <div className="form-grid">
                    <Form.Group className="form-group full-width">
                      <Form.Label>Como conheceu a Programa AI?</Form.Label>
                      <Form.Select name="fonteAI" value={form.fonteAI} onChange={handleChange} className={getFieldClass('fonteAI')}>
                        <option value="">Selecione...</option>
                        <option>Recomendação de amigos</option>
                        <option>Redes sociais</option>
                        <option>Faculdade</option>
                        <option>Outros</option>
                      </Form.Select>
                    </Form.Group>

                    {showAIAmigo && (
                      <Form.Group className="form-group full-width animate-fade-in">
                        <Form.Label>Nome do amigo que indicou</Form.Label>
                        <Form.Control
                          name="amigoIndicacao"
                          value={form.amigoIndicacao}
                          onChange={handleChange}
                          placeholder="Nome e sobrenome do amigo"
                          className={getFieldClass('amigoIndicacao')}
                        />
                      </Form.Group>
                    )}

                    <Form.Group className="form-group full-width">
                      <Form.Label>Como conheceu este curso?</Form.Label>
                      <Form.Select name="fonteCurso" value={form.fonteCurso} onChange={handleChange} className={getFieldClass('fonteCurso')}>
                        <option value="">Selecione...</option>
                        <option>Recomendação de amigos</option>
                        <option>Redes sociais</option>
                        <option>Faculdade</option>
                        <option>Outros</option>
                      </Form.Select>
                    </Form.Group>

                    {showCursoOutro && (
                      <Form.Group className="form-group full-width animate-fade-in">
                        <Form.Label>Detalhe como nos encontrou</Form.Label>
                        <Form.Control
                          name="fonteCursoOutro"
                          value={form.fonteCursoOutro}
                          onChange={handleChange}
                          placeholder="Como exatamente encontrou este curso?"
                          className={getFieldClass('fonteCursoOutro')}
                        />
                      </Form.Group>
                    )}

                    <Form.Group className="form-group full-width">
                      <Form.Label>É estudante da área de TI?</Form.Label>
                      <Form.Select name="estudanteTI" value={form.estudanteTI} onChange={handleChange} className={getFieldClass('estudanteTI')}>
                        <option value="">Selecione...</option>
                        <option>Sim, em andamento</option>
                        <option>Sim, formado</option>
                        <option>Não</option>
                      </Form.Select>
                    </Form.Group>

                    {showEstudanteDetalhe && (
                      <Form.Group className="form-group full-width animate-fade-in">
                        <Form.Label>Onde você estuda/estudou?</Form.Label>
                        <Form.Control
                          name="estudanteDetalhe"
                          value={form.estudanteDetalhe}
                          onChange={handleChange}
                          placeholder="Nome da instituição"
                          className={getFieldClass('estudanteDetalhe')}
                        />
                      </Form.Group>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Finalização */}
              {currentStep === 4 && (
                <div className="inscricao-step-content animate-fade-in">
                  <div className="step-header">
                    <h2><FaCheckCircle /> Finalizar Inscrição</h2>
                    <p>Revise seus dados e complete sua inscrição</p>
                  </div>

                  {/* Resumo dos dados */}
                  <div className="inscricao-summary">
                    <div className="summary-section">
                      <h4><FaUser /> Dados Pessoais</h4>
                      <div className="summary-grid">
                        <div><strong>Nome:</strong> {form.nome}</div>
                        <div><strong>CPF:</strong> {form.cpf}</div>
                        <div><strong>E-mail:</strong> {form.email}</div>
                        <div><strong>Celular:</strong> {form.celular}</div>
                      </div>
                    </div>

                    <div className="summary-section">
                      <h4><FaMapMarkerAlt /> Endereço</h4>
                      <div className="summary-grid">
                        <div className="full-width">
                          {form.logradouro}, {form.numero}
                          {form.complemento && ` - ${form.complemento}`}
                        </div>
                        <div>{form.bairro} - {form.cidade}/{form.estado}</div>
                        <div>CEP: {form.cep}</div>
                      </div>
                    </div>
                  </div>

                  {/* Cupom de desconto */}
                  <div className="inscricao-cupom-section">
                    <h4><FaTag /> Cupom de Desconto</h4>
                    <div className="cupom-input-wrapper">
                      <Form.Control
                        name="cupom"
                        value={cupom}
                        onChange={e => {
                          setCupom(e.target.value.toUpperCase())
                          setValidCupom(null)
                        }}
                        placeholder="Digite seu cupom"
                        className={validCupom === true ? 'field-valid' : validCupom === false ? 'field-invalid' : ''}
                      />
                      <Button 
                        variant="outline-primary" 
                        onClick={checkCupom}
                        disabled={checkingCupom || !cupom.trim()}
                      >
                        {checkingCupom ? <div className="spinner-border spinner-border-sm" /> : 'Aplicar'}
                      </Button>
                    </div>
                    {validCupom === true && (
                      <Alert variant="success" className="mt-2 animate-fade-in">
                        🎉 Cupom válido! Desconto de R$ {desconto.toFixed(2).replace(".", ",")} aplicado.
                      </Alert>
                    )}
                    {validCupom === false && (
                      <Alert variant="danger" className="mt-2 animate-fade-in">
                        ❌ Cupom inválido para este curso.
                      </Alert>
                    )}
                  </div>

                  {/* Termos */}
                  <div className="inscricao-termos-section">
                    <Form.Check
                      type="checkbox"
                      name="aceitaTermos"
                      id="aceitaTermos"
                      checked={form.aceitaTermos}
                      onChange={handleChange}
                      label={
                        <span>
                          Li e concordo com os{" "}
                          <button type="button" className="link-button" onClick={() => setShowTermos(true)}>
                            Termos e Condições do Curso
                          </button>
                        </span>
                      }
                      className="custom-checkbox"
                    />
                  </div>

                  {/* Honeypot */}
                  <Form.Group className="d-none">
                    <Form.Control type="text" name="website" value={form.website} onChange={handleChange} autoComplete="off" />
                  </Form.Group>
                </div>
              )}

              {/* Erros */}
              {(stepErrors[currentStep] || []).length > 0 && (
                <Alert variant="danger" className="inscricao-errors animate-shake">
                  <ul className="mb-0">
                    {stepErrors[currentStep].map((err, idx) => <li key={idx}>{err}</li>)}
                  </ul>
                </Alert>
              )}

              {/* Navigation */}
              <div className="inscricao-navigation">
                {currentStep > 1 && (
                  <Button variant="outline-secondary" onClick={handleBack} className="btn-back">
                    <FaArrowLeft /> Voltar
                  </Button>
                )}
                
                {currentStep < 4 ? (
                  <Button variant="primary" onClick={handleNext} className="btn-next">
                    Continuar <FaArrowRight />
                  </Button>
                ) : (
                  <Button variant="success" type="submit" className="btn-submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><div className="spinner-border spinner-border-sm me-2" /> Enviando...</>
                    ) : (
                      <><FaCheckCircle /> Finalizar Inscrição</>
                    )}
                  </Button>
                )}
              </div>
            </Form>
          </div>
        </main>
      </Container>

      {/* Modals */}
      <Modal show={showTermos} onHide={() => setShowTermos(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Termos do Curso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ maxHeight: "60vh", overflowY: "auto" }} dangerouslySetInnerHTML={{ __html: termosDoCurso }} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTermos(false)}>Fechar</Button>
          <Button variant="primary" onClick={() => { setForm(f => ({ ...f, aceitaTermos: true })); setShowTermos(false) }}>
            Li e Aceito os Termos
          </Button>
        </Modal.Footer>
      </Modal>

      <ParcelamentoModal show={showParcelamento} onHide={() => setShowParcelamento(false)} valor={valorBase} />
    </div>
  )
}

export default Inscricao
