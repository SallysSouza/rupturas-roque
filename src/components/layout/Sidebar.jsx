import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X, ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { MENU } from '../../lib/menu.js'
import Avatar from '../common/Avatar.jsx'
import ConfirmDialog from '../common/ConfirmDialog.jsx'

const ROTULO_PERFIL = {
  vendedor: 'Vendedor',
  comprador: 'Comprador',
  admin: 'Administrador',
}

function ItemMenu({ item, fechar }) {
  const [aberto, setAberto] = useState(false)

  if (item.submenu) {
    return (
      <div>
        <button
          onClick={() => setAberto((v) => !v)}
          className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-roque-blue-100/80 hover:bg-white/5 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-3">
            <item.icon size={18} />
            {item.label}
          </span>
          <ChevronDown size={16} className={`transition-transform ${aberto ? 'rotate-180' : ''}`} />
        </button>
        {aberto && (
          <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-white/10 pl-3">
            {item.submenu.map((sub) => (
              <NavLink
                key={sub.to}
                to={sub.to}
                onClick={fechar}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-roque-gold-400 text-roque-blue-950 font-semibold'
                      : 'text-roque-blue-100/70 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <sub.icon size={16} />
                {sub.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <NavLink
      to={item.to}
      onClick={fechar}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-roque-gold-400 text-roque-blue-950 font-semibold'
            : 'text-roque-blue-100/80 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      <item.icon size={18} />
      {item.label}
    </NavLink>
  )
}

export default function Sidebar() {
  const { perfil, logout } = useAuth()
  const [aberto, setAberto] = useState(false)
  const [confirmandoSaida, setConfirmandoSaida] = useState(false)

  const itensVisiveis = MENU.filter((item) => !perfil || item.perfis.includes(perfil.role))

  const conteudo = (
    <div className="flex h-full flex-col bg-roque-blue-950 text-white">
      {/* Cabeçalho com dados do usuário logado */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5">
        <Avatar nome={perfil?.nome} />
        <div className="min-w-0">
          <p className="truncate font-display font-bold text-sm">{perfil?.nome}</p>
          <p className="text-xs text-roque-gold-400 font-medium">{ROTULO_PERFIL[perfil?.role] || perfil?.role}</p>
          <p className="truncate text-xs text-roque-blue-100/50">{perfil?.email}</p>
        </div>
        <button
          className="ml-auto rounded-lg p-1.5 text-roque-blue-100/70 hover:bg-white/10 lg:hidden"
          onClick={() => setAberto(false)}
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Itens de navegação, filtrados por perfil */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {itensVisiveis.map((item) => (
          <ItemMenu key={item.label} item={item} fechar={() => setAberto(false)} />
        ))}
      </nav>

      {/* Sair deste login */}
      <div className="border-t border-white/10 p-3">
        <button
          onClick={() => setConfirmandoSaida(true)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-roque-blue-100/80 hover:bg-signal-red/10 hover:text-signal-red transition-colors"
        >
          <LogOut size={18} />
          Sair deste login
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Botão hambúrguer (mobile) */}
      <button
        onClick={() => setAberto(true)}
        className="fixed left-4 top-4 z-30 rounded-xl bg-roque-blue-950 p-2.5 text-white shadow-lg lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar fixa em telas grandes */}
      <aside className="hidden lg:block lg:w-72 lg:shrink-0">
        <div className="fixed h-screen w-72">{conteudo}</div>
      </aside>

      {/* Sidebar off-canvas em telas pequenas */}
      {aberto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAberto(false)} />
          <div className="absolute inset-y-0 left-0 w-72 shadow-2xl animate-in slide-in-from-left">{conteudo}</div>
        </div>
      )}

      <ConfirmDialog
        aberto={confirmandoSaida}
        titulo="Sair deste login?"
        descricao="Sua sessão será encerrada e você voltará para a tela de login."
        textoConfirmar="Sair"
        onCancelar={() => setConfirmandoSaida(false)}
        onConfirmar={() => {
          setConfirmandoSaida(false)
          logout()
        }}
      />
    </>
  )
}
