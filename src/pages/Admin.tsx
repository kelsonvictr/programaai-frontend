import { useState, useEffect } from 'react'
import axios from 'axios'
import { auth } from '../firebase'
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'
import { Container, Table, Button, Form, Spinner, Alert } from 'react-bootstrap'

const API_URL = `${import.meta.env.VITE_API_URL}/admin/inscricoes`
const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY

export default function Admin() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [inscricoes, setInscricoes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (u) fetchInscricoes()
    })
  }, [])

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, senha)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const logout = async () => {
    await signOut(auth)
    setInscricoes([])
  }

  const fetchInscricoes = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(API_URL, {
        headers: { 'x-api-key': ADMIN_KEY }
      })
      setInscricoes(data)
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar inscrições')
    } finally {
      setLoading(false)
    }
  }

  const deletar = async (id: string) => {
    if (!window.confirm('Confirma excluir esta inscrição?')) return
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { 'x-api-key': ADMIN_KEY }
      })
      setInscricoes(inscricoes.filter(i => i.id !== id))
    } catch (err) {
      console.error(err)
      setError('Erro ao deletar inscrição')
    }
  }

  if (!user) {
    return (
      <Container className="py-5" style={{ maxWidth: 400 }}>
        <h2>Login Admin</h2>
        <Form onSubmit={login}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control value={email} onChange={e => setEmail(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Senha</Form.Label>
            <Form.Control type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
          </Form.Group>
          <Button type="submit">Entrar</Button>
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Form>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <h2>Inscrições</h2>
      <Button variant="secondary" onClick={logout} className="mb-3">Sair</Button>
      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Curso</th>
            <th>Email</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {inscricoes.map(i => (
            <tr key={i.id}>
              <td>{i.nomeCompleto}</td>
              <td>{i.curso}</td>
              <td>{i.email}</td>
              <td>
                <Button variant="danger" size="sm" onClick={() => deletar(i.id)}>
                  🗑️ Deletar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  )
}
