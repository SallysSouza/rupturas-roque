import { useState } from 'react'
import { KeyRound, CheckCircle2 } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout.jsx'
import Avatar from '../components/common/Avatar.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

const ROTULO_PERFIL = {
  vendedor: 'Vendedor',
  comprador: 'Comprador',
  admin: 'Administrador',
}

function ModalAlterarSenha({ onFechar }) {
  const { alterarSenha } = useAuth()
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    if (novaSenha.length < 6) return setErro('A senha precisa ter pelo menos 6 caracteres.')
    if (novaSenha !== confirmacao) return setErro('As senhas não coincidem.')

    setSalvando(true)
    try {
      await alterarSenha(novaSenha)
      setSucesso(true)
    } catch {
      setErro('Não foi possível alterar a senha. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-concrete-950/50" onClick={onFechar} />
      <div className="card relative w-full max-w-sm p-6">
        <h3 className="mb-4 font-display font-bold text-concrete-900">Alterar senha</h3>

        {sucesso ? (
          <div className="flex items-center gap-2 rounded-xl bg-signal-green/10 p-3 text-sm text-signal-green">
            <CheckCircle2 size={16} />
            Senha alterada com sucesso.
          </div>
        ) : (
          <form onSubmit={salvar}>
            <label className="label">Nova senha</label>
            <input type="password" className="input mb-4" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
            <label className="label">Confirmar nova senha</label>
            <input type="password" className="input mb-4" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} />
            {erro && <p className="mb-3 text-sm text-signal-red">{erro}</p>}
            <button type="submit" className="btn-primary w-full" disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar nova senha'}
            </button>
          </form>
        )}

        <button className="btn-ghost mt-3 w-full" onClick={onFechar}>
          Fechar
        </button>
      </div>
    </div>
  )
}

export default function MinhaConta() {
  const { perfil } = useAuth()
  const [modalAberto, setModalAberto] = useState(false)

  return (
    <AppLayout titulo="Minha Conta">
      <div className="mx-auto max-w-lg card p-6">
        <div className="mb-6 flex items-center gap-4">
          <Avatar nome={perfil?.nome} size={56} />
          <div>
            <p className="font-display text-lg font-bold text-concrete-900">{perfil?.nome}</p>
            <p className="text-sm font-medium text-roque-gold-600">{ROTULO_PERFIL[perfil?.role] || perfil?.role}</p>
          </div>
        </div>

        <dl className="space-y-4">
          <div>
            <dt className="label mb-0.5">E-mail</dt>
            <dd className="text-sm text-concrete-900">{perfil?.email}</dd>
          </div>
          <div>
            <dt className="label mb-0.5">Senha</dt>
            <dd className="font-mono text-sm tracking-widest text-concrete-900">••••••••••</dd>
          </div>
        </dl>

        <button onClick={() => setModalAberto(true)} className="btn-primary mt-6">
          <KeyRound size={16} />
          Alterar senha
        </button>
      </div>

      {modalAberto && <ModalAlterarSenha onFechar={() => setModalAberto(false)} />}
    </AppLayout>
  )
}
