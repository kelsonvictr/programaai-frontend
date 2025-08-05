// src/pages/Inscricao.tsx

import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Container, Form, Button, Alert, Modal } from "react-bootstrap"
import axios from "axios"
import { termosDoCurso } from "../mocks/terms"
import ParcelamentoModal from "../components/ParcelamentoModal"
import { FaWhatsapp } from "react-icons/fa"

// Tipo genérico para Form.Control (input, select ou textarea)
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

const Inscricao: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // ─── Estados ───────────────────────────────────────────────────
  const [form, setForm] = useState<FormState>({
    nome: "",
    cpf: "",
    rg: "",
    dataNascimento: "",
    celular: "+55 ",
    email: "",
    emailConfirm: "",
    sexo: "",
    fonteAI: "",
    amigoIndicacao: "",
    fonteCurso: "",
    fonteCursoOutro: "",
    estudanteTI: "",
    estudanteDetalhe: "",
    aceitaTermos: false,
    website: "",
  })
  const [errors, setErrors] = useState<string[]>([])
  const [showAIAmigo, setShowAIAmigo] = useState(false)
  const [showCursoOutro, setShowCursoOutro] = useState(false)
  const [showEstudanteDetalhe, setShowEstudanteDetalhe] = useState(false)
  const [showTermos, setShowTermos] = useState(false)
  const [showParcelamento, setShowParcelamento] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CARTAO">("PIX")
  const [showSucesso, setShowSucesso] = useState(false)
  const [linkPagamento, setLinkPagamento] = useState("")
  const [isClubeMember, setIsClubeMember] = useState(false)
  const [checkingClube, setCheckingClube] = useState(false)
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  // ─── Função de checagem de clube ───────────────────────────────
  const checkClube = async (email: string) => {
    if (!email) return
    setCheckingClube(true)
    try {
      const resp = await axios.get(
        `${import.meta.env.VITE_API_URL}/clube/interesse`,
        { params: { email } }
      )
      setIsClubeMember(resp.data.existe)
    } catch {
      // silencia erro
    } finally {
      setCheckingClube(false)
    }
  }

  const handleEmailConfirmBlur = () => {
    if (
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
      form.email === form.emailConfirm
    ) {
      checkClube(form.email)
    }
  }

  // ─── Carrega o curso ────────────────────────────────────────────
  useEffect(() => {
    if (!id) {
      navigate("/")
      return
    }
    axios
      .get<Course | Course[]>(`${import.meta.env.VITE_API_URL}/cursos`, {
        params: { id }
      })
      .then(resp => {
        const data = resp.data
        const curso = Array.isArray(data) ? data[0] : data
        if (!curso) {
          navigate("/")
        } else {
          setCourse(curso)
        }
      })
      .catch(() => {
        navigate("/")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id, navigate])

  // ─── Reage a mudanças de e-mail ─────────────────────────────────
  useEffect(() => {
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    if (emailValido && form.email === form.emailConfirm) {
      checkClube(form.email)
    } else {
      setIsClubeMember(false)
    }
  }, [form.email, form.emailConfirm])

  // ─── Early returns ──────────────────────────────────────────────
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border" role="status" />
      </Container>
    )
  }
  if (!course) return null

  // ─── Máscaras ───────────────────────────────────────────────────
  const maskCpf = (v: string) =>
    v.replace(/\D/g, "")
      .slice(0, 11)
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3}\.\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3}\.\d{3}\.\d{3})(\d)/, "$1-$2")
  const maskDate = (v: string) =>
    v.replace(/\D/g, "")
      .slice(0, 8)
      .replace(/^(\d{2})(\d)/, "$1/$2")
      .replace(/^(\d{2}\/\d{2})(\d)/, "$1/$2")
  const maskCel = (v: string) => {
    let raw = v.replace(/\D/g, "")
    if (!raw.startsWith("55")) raw = "55" + raw
    raw = raw.slice(0, 13)
    return (
      "+" +
      raw.slice(0, 2) +
      (raw.length > 2 ? " (" + raw.slice(2, 4) + ")" : "") +
      (raw.length >= 4 ? " " + raw.slice(4, 9) : "") +
      (raw.length >= 9 ? "-" + raw.slice(9, 13) : "")
    )
  }

  // ─── Handlers ───────────────────────────────────────────────────
const handleChange: React.ChangeEventHandler<FormControlElement> = e => {
  const { name, type, value } = e.target
  // só extrai checked via cast, porque só faz sentido em <input type="checkbox">
  const checked = (e.target as HTMLInputElement).checked

  if (name === "email" || name === "emailConfirm") {
    setIsClubeMember(false)
  }

  setForm(f => ({
    ...f,
    [name]: type === "checkbox" ? checked : value
  }))
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

  const validate = () => {
    const errs: string[] = []
    if (!form.nome.trim()) errs.push("Nome completo é obrigatório.")
    if (!/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(form.cpf)) errs.push("CPF inválido.")
    if (!form.rg.trim()) errs.push("RG é obrigatório.")
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(form.dataNascimento)) errs.push("Data de nascimento inválida.")
    if (!/^\+\d{2}\s\(\d{2}\)\s\d{5}\-\d{4}$/.test(form.celular)) errs.push("Celular inválido.")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.push("E-mail inválido.")
    if (form.email !== form.emailConfirm) errs.push("E-mails não conferem.")
    if (!form.sexo) errs.push("Selecione seu sexo.")
    if (!form.fonteAI) errs.push("Como conheceu a Programa AI? é obrigatório.")
    if (form.fonteAI === "Recomendação de amigos" && !form.amigoIndicacao.trim())
      errs.push("Informe nome e sobrenome do amigo que indicou.")
    if (!form.fonteCurso) errs.push("Como conheceu este curso? é obrigatório.")
    if (form.fonteCurso === "Outros" && !form.fonteCursoOutro.trim())
      errs.push("Detalhe como conheceu o curso.")
    if (!form.estudanteTI) errs.push("Informe se é estudante de TI.")
    if (form.estudanteTI !== "Não" && !form.estudanteDetalhe.trim())
      errs.push("Detalhe onde estuda/estudou.")
    if (!form.aceitaTermos) errs.push("Você precisa concordar com os termos.")
    if (form.website.trim() !== "") errs.push("A submissão foi bloqueada por comportamento suspeito.")

    setErrors(errs)
    return errs.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    try {
      const resp = await axios.post(`${import.meta.env.VITE_API_URL}/inscricao`, {
        nomeCompleto: form.nome,
        cpf: form.cpf,
        rg: form.rg,
        email: form.email,
        whatsapp: form.celular.replace(/\D/g, ""),
        sexo: form.sexo,
        dataNascimento: form.dataNascimento.split("/").reverse().join("-"),
        formacaoTI: form.estudanteTI,
        ondeEstuda: form.estudanteDetalhe,
        comoSoube:
          form.fonteAI === "Outros"
            ? form.fonteCursoOutro
            : form.fonteAI === "Recomendação de amigos"
            ? `Indicação de ${form.amigoIndicacao}`
            : form.fonteAI,
        nomeAmigo: form.amigoIndicacao || "",
        curso: course.title,
        aceitouTermos: form.aceitaTermos,
        versaoTermo: "v1.0",
        valor:
          parseFloat(course.price.replace("R$", "").replace(",", ".")) *
          (isClubeMember ? 0.95 : 1),
        paymentMethod
      })
      const link = resp.data.linkPagamento
      setLinkPagamento(link)
      setShowSucesso(true)
      setTimeout(() => (window.location.href = link), 10000)
    } catch {
      setErrors(["Erro ao enviar sua inscrição. Tente novamente mais tarde."])
    }
  }

  // ─── JSX ────────────────────────────────────────────────────────
  const valorBase = parseFloat(course.price.replace("R$", "").replace(",", "."))
  const valorBaseDesconto = isClubeMember ? +(valorBase * 0.95).toFixed(2) : valorBase
  const valorCartao = +(valorBaseDesconto * 1.08).toFixed(2)
  const parcela12x = +(valorCartao / 12).toFixed(2)

  return (
    <Container className="py-5" style={{ maxWidth: 600 }}>
      <h2 className="mb-2 text-center">Inscrição: {course.title}</h2>
      <p className="text-center mb-2">
        <strong>Valor do curso:</strong> {course.price}
      </p>

      <div className="mb-4">
        <strong>Escolha a forma de pagamento:</strong>
        <Form.Check
          type="radio"
          label={`PIX - R$ ${valorBaseDesconto.toFixed(2).replace('.', ',')}`}
          name="paymentMethod"
          checked={paymentMethod === "PIX"}
          onChange={() => setPaymentMethod("PIX")}
        />

        <Form.Check
          type="radio"
          label={`Cartão de Crédito - R$ ${valorCartao.toFixed(2).replace('.', ',')} (até 12x de R$ ${parcela12x.toFixed(2).replace('.', ',')})`}
          name="paymentMethod"
          checked={paymentMethod === "CARTAO"}
          onChange={() => setPaymentMethod("CARTAO")}
        />
      </div>

      <Button
            as="a"
            href={`https://wa.me/5583986608771?text=${encodeURIComponent(
              "Oi prof. Kelson, venho do site da programa AI, poderia me esclarecer algumas dúvidas?"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            variant="success"
            size="lg"
          >
            <FaWhatsapp size={20} className="me-2" />
            Fala com a gente pelo WhatsApp
          </Button>
          <br/>

      {errors.length > 0 && (
        <Alert variant="danger">
          <ul className="mb-0">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Form noValidate onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>
                            Nome completo <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            name="nome"
                            value={form.nome}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>
                            CPF <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            name="cpf"
                            value={form.cpf}
                            onChange={handleCpfChange}
                            placeholder="000.000.000-00"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>
                            RG <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            name="rg"
                            value={form.rg}
                            onChange={handleChange}
                            placeholder="Digite seu RG"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>
                            Data de nascimento <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            name="dataNascimento"
                            value={form.dataNascimento}
                            onChange={handleDateChange}
                            placeholder="DD/MM/AAAA"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>
                            Celular / WhatsApp <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            name="celular"
                            value={form.celular}
                            onChange={handleCelChange}
                            placeholder="+55 (00) 00000-0000"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>
                            E-mail <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>
                            Confirme o e-mail <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            type="email"
                            name="emailConfirm"
                            value={form.emailConfirm}
                            onChange={handleChange}
                            onBlur={handleEmailConfirmBlur}
                            required
                        />
                    </Form.Group>

                    {checkingClube && <p>🔍 Verificando desconto do Clube...</p>}
                    {isClubeMember && (
                      <Alert variant="success">
                        🎉 Você ganhou 5% de desconto por ser membro do Clube programa AI!
                      </Alert>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label>
                            Sexo <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                            name="sexo"
                            value={form.sexo}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Selecione...</option>
                            <option>Masculino</option>
                            <option>Feminino</option>
                            <option>Não-binário</option>
                            <option>Prefiro não dizer</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>
                            Como conheceu a programa AI? <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                            name="fonteAI"
                            value={form.fonteAI}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Selecione...</option>
                            <option>Recomendação de amigos</option>
                            <option>Redes sociais</option>
                            <option>Faculdade</option>
                            <option>Outros</option>
                        </Form.Select>
                    </Form.Group>

                    {showAIAmigo && (
                        <Form.Group className="mb-3">
                            <Form.Label>
                                Nome e sobrenome do amigo indicado{" "}
                                <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                name="amigoIndicacao"
                                value={form.amigoIndicacao}
                                onChange={handleChange}
                                placeholder="Digite nome e sobrenome do amigo"
                                required
                            />
                        </Form.Group>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label>
                            Como conheceu este curso? <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                            name="fonteCurso"
                            value={form.fonteCurso}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Selecione...</option>
                            <option>Recomendação de amigos</option>
                            <option>Redes sociais</option>
                            <option>Faculdade</option>
                            <option>Outros</option>
                        </Form.Select>
                    </Form.Group>

                    {showCursoOutro && (
                        <Form.Group className="mb-3">
                            <Form.Label>
                                Detalhe como nos encontrou <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                name="fonteCursoOutro"
                                value={form.fonteCursoOutro}
                                onChange={handleChange}
                                placeholder="Como exatamente encontrou este curso?"
                                required
                            />
                        </Form.Group>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label>
                            É estudante da área de TI? <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                            name="estudanteTI"
                            value={form.estudanteTI}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Selecione...</option>
                            <option>Sim, em andamento</option>
                            <option>Sim, formado</option>
                            <option>Não</option>
                        </Form.Select>
                    </Form.Group>

                    {showEstudanteDetalhe && (
                        <Form.Group className="mb-3">
                            <Form.Label>
                                Onde você estuda/estudou? <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                name="estudanteDetalhe"
                                value={form.estudanteDetalhe}
                                onChange={handleChange}
                                placeholder="Onde você estuda/estudou?"
                                required
                            />
                        </Form.Group>
                    )}

                    <Form.Group className="mb-4">
                        <Form.Check
                            type="checkbox"
                            name="aceitaTermos"
                            label={
                                <>
                                    Concordo com os <span
                                        className="text-decoration-underline text-primary"
                                        role="button"
                                        onClick={() => setShowTermos(true)}
                                    >
                                        Termos para participar do curso
                                    </span>{" "}
                                    <span className="text-danger">*</span>
                                </>
                            }
                            checked={form.aceitaTermos}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="d-none">
                        <Form.Label>Website</Form.Label>
                        <Form.Control
                            type="text"
                            name="website"
                            value={form.website}
                            onChange={handleChange}
                            autoComplete="off"
                        />
                    </Form.Group>

                    {errors.length > 0 && (
                        <Alert variant="danger">
                            <ul className="mb-0">
                                {errors.map((err, idx) => (
                                    <li key={idx}>{err}</li>
                                ))}
                            </ul>
                        </Alert>
                    )}

                    <div className="text-center">
                        <Button variant="primary" type="submit">
                            Enviar Inscrição
                        </Button>
                    </div>
                </Form>

      <Modal show={showTermos} onHide={() => setShowTermos(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Termos do Curso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ maxHeight: "60vh", overflowY: "auto" }} dangerouslySetInnerHTML={{ __html: termosDoCurso }} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTermos(false)}>Fechar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showSucesso} onHide={() => {}} backdrop="static" keyboard={false} centered>
      <Modal.Header>
        <Modal.Title>Inscrição efetuada com sucesso!</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>✅ Sua inscrição foi realizada com sucesso!</p>
        <p>📄 <a href={linkPagamento} target="_blank" rel="noopener noreferrer">
          Clique aqui para proceder com o pagamento
        </a></p>
        <p>✉️ Você também receberá um e-mail com as informações de pagamento.</p>
        <div className="text-center mt-3">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2">Você será redirecionado automaticamente em até 10 segundos…</p>
        </div>
      </Modal.Body>
    </Modal>

      <ParcelamentoModal show={showParcelamento} onHide={() => setShowParcelamento(false)} valor={valorBase} />
    </Container>
  )
}

export default Inscricao
