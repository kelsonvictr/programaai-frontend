// src/pages/Inscricao.tsx
import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Container,
  Form,
  Button,
  Alert,
} from "react-bootstrap"
import { courses } from "../mocks/courses"

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
}

const Inscricao: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const course = courses.find(c => c.id === Number(id))

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
  })
  const [errors, setErrors] = useState<string[]>([])
  const [showAIAmigo, setShowAIAmigo] = useState(false)
  const [showCursoOutro, setShowCursoOutro] = useState(false)
  const [showEstudanteDetalhe, setShowEstudanteDetalhe] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!course) navigate("/cursos")
  }, [course, navigate])

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
    raw = raw.slice(0, 11)
    return (
      "+" +
      raw.slice(0, 2) +
      (raw.length > 2 ? " (" + raw.slice(2, 4) + ")" : "") +
      (raw.length >= 4 ? " " + raw.slice(4, 9) : "") +
      (raw.length >= 9 ? "-" + raw.slice(9) : "")
    )
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement
    const { name, type, value } = target

    const checked =
      type === "checkbox" ? (target as HTMLInputElement).checked : undefined

    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked ?? false : value,
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
    if (!/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(form.cpf))
      errs.push("CPF inválido.")
    if (!form.rg.trim()) errs.push("RG é obrigatório.")
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(form.dataNascimento))
      errs.push("Data de nascimento inválida.")
    if (!/^\+\d{2}\s\(\d{2}\)\s\d{5}\-\d{4}$/.test(form.celular))
      errs.push("Celular inválido.")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.push("E-mail inválido.")
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
    setErrors(errs)
    return errs.length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    console.log("Inscrição enviada:", form, course?.title)
    setSubmitted(true)
  }

  if (!course) return null

  return (
    <Container className="py-5" style={{ maxWidth: 600 }}>
      <h2 className="mb-2 text-center">Inscrição: {course.title}</h2>
      <p className="text-center mb-2">
        <strong>Valor do curso:</strong> {course.price}
      </p>
      <p className="text-center mb-4 text-muted">
        Você receberá via WhatsApp e e-mail as instruções de pagamento.<br/>
        Sua vaga só será confirmada após confirmação do pagamento.
      </p>
      <p className="text-danger text-center mb-4">
        * Todos os campos abaixo são obrigatórios
      </p>

      {submitted && (
        <Alert variant="success">Sua inscrição foi enviada com sucesso!</Alert>
      )}

      {!submitted && (
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
              required
            />
          </Form.Group>

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
              Como conheceu a Programa AI? <span className="text-danger">*</span>
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
                  Concordo com os Termos para participar do curso{" "}
                  <span className="text-danger">*</span>
                </>
              }
              checked={form.aceitaTermos}
              onChange={handleChange}
              required
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
      )}
    </Container>
  )
}

export default Inscricao

