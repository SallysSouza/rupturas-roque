import { useState } from 'react'
import { Search, Pencil, Trash2 } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import Badge from '../../components/common/Badge.jsx'
import { useDebounce } from '../../hooks/useDebounce.js'
import { useProdutosPaginados } from '../../hooks/useProdutosPaginados.js'
import { supabase } from '../../supabaseClient'

function ModalEdicao({ produto, onFechar, onSalvo }) {
  const [form, setForm] = useState(produto)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function salvar(e) {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    const { error } = await supabase
      .from('produtos')
      .update({
        descricao: form.descricao,
        departamento: form.departamento,
        subcategoria: form.subcategoria,
        fornecedor: form.fornecedor,
        unidade: form.unidade,
      })
      .eq('codigo', produto.codigo)
    setSalvando(false)
    if (error) return setErro('Não foi possível salvar. Tente novamente.')
    onSalvo()
    onFechar()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-concrete-950/50" onClick={onFechar} />
      <form onSubmit={salvar} className="card relative w-full max-w-md p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-concrete-500">{produto.codigo}</p>
        <h3 className="mb-4 font-display text-lg font-bold text-roque-blue-950">Editar produto</h3>

        <label className="label">Descrição</label>
        <input
          className="input mb-4"
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          required
        />
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="label">Departamento</label>
            <input className="input" value={form.departamento || ''} onChange={(e) => setForm({ ...form, departamento: e.target.value })} />
          </div>
          <div>
            <label className="label">Subcategoria</label>
            <input className="input" value={form.subcategoria || ''} onChange={(e) => setForm({ ...form, subcategoria: e.target.value })} />
          </div>
        </div>
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div>
            <label className="label">Fornecedor</label>
            <input className="input" value={form.fornecedor || ''} onChange={(e) => setForm({ ...form, fornecedor: e.target.value })} />
          </div>
          <div>
            <label className="label">Unidade</label>
            <input className="input" value={form.unidade || ''} onChange={(e) => setForm({ ...form, unidade: e.target.value })} />
          </div>
        </div>

        {erro && <p className="mb-3 text-sm text-signal-red">{erro}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onFechar}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function Gestao() {
  const [termo, setTermo] = useState('')
  const termoDebounced = useDebounce(termo, 300)
  const { produtos, total, carregando, temMais, carregarMais, recarregar } = useProdutosPaginados(termoDebounced)

  const [emEdicao, setEmEdicao] = useState(null)
  const [emExclusao, setEmExclusao] = useState(null)
  const [excluindo, setExcluindo] = useState(false)

  async function confirmarExclusao() {
    setExcluindo(true)
    await supabase.from('produtos').delete().eq('codigo', emExclusao.codigo)
    setExcluindo(false)
    setEmExclusao(null)
    recarregar()
  }

  return (
    <AppLayout titulo="Gestão do Cadastro">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="relative max-w-md flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-500" />
          <input
            className="input pl-10"
            placeholder="Buscar por código, descrição, departamento…"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
          />
        </div>
        <p className="shrink-0 text-sm text-concrete-500">{total.toLocaleString('pt-BR')} produtos</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-concrete-50 text-left text-xs uppercase tracking-wide text-concrete-500">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Departamento</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-concrete-100">
            {produtos.map((p) => (
              <tr key={p.codigo}>
                <td className="px-4 py-3 font-mono text-xs text-concrete-500">{p.codigo}</td>
                <td className="px-4 py-3 font-medium text-concrete-900">{p.descricao}</td>
                <td className="px-4 py-3 text-concrete-500">{p.departamento || '—'}</td>
                <td className="px-4 py-3">
                  <Badge texto={p.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button className="rounded-lg p-2 text-concrete-500 hover:bg-concrete-100" onClick={() => setEmEdicao(p)} title="Editar">
                      <Pencil size={16} />
                    </button>
                    <button
                      className="rounded-lg p-2 text-signal-red hover:bg-signal-red/10"
                      onClick={() => setEmExclusao(p)}
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {carregando && <p className="p-4 text-center text-sm text-concrete-500">Carregando…</p>}
        {!carregando && produtos.length === 0 && (
          <p className="p-8 text-center text-sm text-concrete-500">Nenhum produto encontrado.</p>
        )}
        {temMais && !carregando && (
          <button onClick={carregarMais} className="w-full border-t border-concrete-100 py-3 text-sm font-medium text-roque-blue-700 hover:bg-concrete-50">
            Carregar mais produtos
          </button>
        )}
      </div>

      {emEdicao && <ModalEdicao produto={emEdicao} onFechar={() => setEmEdicao(null)} onSalvo={recarregar} />}

      <ConfirmDialog
        aberto={!!emExclusao}
        titulo="Excluir este produto?"
        descricao={emExclusao ? `"${emExclusao.descricao}" será removido definitivamente do cadastro.` : ''}
        textoConfirmar="Excluir"
        destrutivo
        carregando={excluindo}
        onCancelar={() => setEmExclusao(null)}
        onConfirmar={confirmarExclusao}
      />
    </AppLayout>
  )
}
