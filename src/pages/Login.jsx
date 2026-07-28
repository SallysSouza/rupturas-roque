import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Login() {
  const { login, autenticado } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  if (autenticado) {
    navigate(location.state?.de || '/dashboard', { replace: true })
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      await login(email, senha)
      navigate(location.state?.de || '/dashboard', { replace: true })
    } catch (err) {
      setErro('E-mail ou senha inválidos.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-roque-blue-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-extrabold text-white">Rupturas Roque</h1>
          <p className="mt-1 text-sm text-roque-blue-100/60">Forquilha · Angelim · Santa Inês</p>
        </div>
        <form onSubmit={handleSubmit} className="card p-6">
          <label className="label" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            className="input mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@roqueac.com.br"
          />
          <label className="label" htmlFor="senha">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            required
            className="input"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
          />
          {erro && <p className="mt-3 text-sm text-signal-red">{erro}</p>}
          <button type="submit" disabled={carregando} className="btn-primary mt-6 w-full">
            {carregando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
