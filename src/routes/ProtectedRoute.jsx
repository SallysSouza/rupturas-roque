import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

/**
 * Protege rotas internas. Revalida a sessão a cada render (inclusive quando
 * o usuário usa o botão "Voltar" do navegador após um logout), garantindo
 * que nenhuma tela com dados fique acessível sem sessão válida.
 *
 * `perfisPermitidos` (opcional) restringe a rota a determinados perfis,
 * espelhando o menu lateral (ex: telas de Produtos só para comprador/admin).
 */
export default function ProtectedRoute({ children, perfisPermitidos }) {
  const { autenticado, carregando, perfil } = useAuth()
  const location = useLocation()

  if (carregando) {
    return (
      <div className="flex h-screen items-center justify-center text-concrete-500 text-sm">
        Carregando…
      </div>
    )
  }

  if (!autenticado) {
    return <Navigate to="/login" replace state={{ de: location.pathname }} />
  }

  if (perfisPermitidos && perfil && !perfisPermitidos.includes(perfil.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
