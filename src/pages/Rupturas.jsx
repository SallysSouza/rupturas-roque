import { useEffect, useState } from 'react'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout.jsx'
import Badge from '../components/common/Badge.jsx'
import ConfirmDialog from '../components/common/ConfirmDialog.jsx'
import { supabase } from '../supabaseClient'

const STATUS_DISPONIVEIS = ['Em análise', 'Pedido realizado', 'Em trânsito', 'Resolvido']

function ModalRuptura({ ruptura, onFechar, onSalvar }) {
  const [status, setStatus] = useState(ruptura.status)
  const [observacao, setObservacao] = useState(ruptura.observacao || '')
  const [salvando, setSalvando] = useState(false)

  async function salvar() {
    setSalvando(true)
    await onSalvar(ruptura.id, { status, observacao })
    setSalvando(false)
    onFechar()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-concrete-950/50" onClick={onFechar} />
      <div className="card relative w-full max-w-md p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-concrete-500">Ruptura</p>
        <h3 className="mb-4 font-display text-lg font-bold text-roque-blue-950">{ruptura.produto_descricao}</h3>

        <label className="label">Status</label>
        <select className="input mb-4" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_DISPONIVEIS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <label className="label">Observação</label>
        <textarea className="input mb-5 min-h-24" value={observacao} onChange={(e) => setObservacao(e.target.value)} />

        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onFechar}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={salvar} disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Rupturas() {
  const [rupturas, setRupturas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [emEdicao, setEmEdicao] = useState(null)
  const [emExclusao, setEmExclusao] = useState(null)
  const [excluindo, setExcluindo] = useState(false)

  async function carregar() {
    const { data } = await supabase.from('rupturas').select('*').order('data_hora', { ascending: false })
    setRupturas(data || [])
    setCarregando(false)
  }

  useEffect(() => {
    carregar()
    const canal = supabase
      .channel('rupturas-gestao')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rupturas' }, carregar)
      .subscribe()
    return () => supabase.removeChannel(canal)
  }, [])

  async function salvarEdicao(id, dados) {
    await supabase.from('rupturas').update(dados).eq('id', id)
  }

  async function confirmarExclusao() {
    setExcluindo(true)
    await supabase.from('rupturas').delete().eq('id', emExclusao.id)
    setExcluindo(false)
    setEmExclusao(null)
  }

  return (
    <AppLayout titulo="Rupturas">
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-concrete-50 text-left text-xs uppercase tracking-wide text-concrete-500">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Loja</th>
              <th className="px-4 py-3">Registrado por</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-concrete-100">
            {rupturas.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-concrete-900">{r.produto_descricao}</p>
                  <p className="text-xs text-concrete-500">{r.produto_codigo}</p>
                </td>
                <td className="px-4 py-3 text-concrete-500">{r.loja || '—'}</td>
                <td className="px-4 py-3 text-concrete-500">{r.criado_por_nome || '—'}</td>
                <td className="px-4 py-3 text-concrete-500">{new Date(r.data_hora).toLocaleString('pt-BR')}</td>
                <td className="px-4 py-3">
                  <Badge texto={r.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      className="rounded-lg p-2 text-concrete-500 hover:bg-concrete-100"
                      title="Visualizar / Editar"
                      onClick={() => setEmEdicao(r)}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="rounded-lg p-2 text-concrete-500 hover:bg-concrete-100"
                      title="Editar"
                      onClick={() => setEmEdicao(r)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="rounded-lg p-2 text-signal-red hover:bg-signal-red/10"
                      title="Excluir"
                      onClick={() => setEmExclusao(r)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!carregando && rupturas.length === 0 && (
          <p className="p-8 text-center text-sm text-concrete-500">Nenhuma ruptura registrada até o momento.</p>
        )}
      </div>

      {emEdicao && <ModalRuptura ruptura={emEdicao} onFechar={() => setEmEdicao(null)} onSalvar={salvarEdicao} />}

      <ConfirmDialog
        aberto={!!emExclusao}
        titulo="Tem certeza que deseja excluir esta ruptura?"
        descricao={emExclusao ? `"${emExclusao.produto_descricao}" será removida definitivamente.` : ''}
        textoConfirmar="Excluir"
        destrutivo
        carregando={excluindo}
        onCancelar={() => setEmExclusao(null)}
        onConfirmar={confirmarExclusao}
      />
    </AppLayout>
  )
}
