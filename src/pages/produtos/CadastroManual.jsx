import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout.jsx'
import { supabase } from '../../supabaseClient'

const VAZIO = { codigo: '', descricao: '', departamento: '', subcategoria: '', fornecedor: '', unidade: '' }

export default function CadastroManual() {
  const [form, setForm] = useState(VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState(null)

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  async function salvar(e) {
    e.preventDefault()
    setSalvando(true)
    setMensagem(null)
    const { error } = await supabase.from('produtos').upsert(
      { ...form, codigo: form.codigo.trim(), descricao: form.descricao.trim(), status: 'ativo' },
      { onConflict: 'codigo' },
    )
    setSalvando(false)
    if (error) return setMensagem({ tipo: 'erro', texto: 'Não foi possível salvar. Verifique os dados.' })
    setMensagem({ tipo: 'ok', texto: `Produto "${form.descricao}" cadastrado.` })
    setForm(VAZIO)
  }

  return (
    <AppLayout titulo="Cadastro Manual">
      <div className="mx-auto max-w-xl">
        <form onSubmit={salvar} className="card p-6">
          {mensagem && (
            <div
              className={`mb-4 flex items-center gap-2 rounded-xl p-3 text-sm ${
                mensagem.tipo === 'ok' ? 'bg-signal-green/10 text-signal-green' : 'bg-signal-red/10 text-signal-red'
              }`}
            >
              <CheckCircle2 size={16} />
              {mensagem.texto}
            </div>
          )}

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="label">Código</label>
              <input className="input" required value={form.codigo} onChange={(e) => set('codigo', e.target.value)} placeholder="0001234" />
            </div>
            <div>
              <label className="label">Unidade</label>
              <input className="input" value={form.unidade} onChange={(e) => set('unidade', e.target.value)} placeholder="UN, KG, CX…" />
            </div>
          </div>

          <label className="label">Descrição</label>
          <input className="input mb-4" required value={form.descricao} onChange={(e) => set('descricao', e.target.value)} placeholder="Cimento" />

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="label">Departamento</label>
              <input className="input" value={form.departamento} onChange={(e) => set('departamento', e.target.value)} />
            </div>
            <div>
              <label className="label">Subcategoria</label>
              <input className="input" value={form.subcategoria} onChange={(e) => set('subcategoria', e.target.value)} />
            </div>
          </div>

          <label className="label">Fornecedor</label>
          <input className="input mb-6" value={form.fornecedor} onChange={(e) => set('fornecedor', e.target.value)} />

          <button type="submit" disabled={salvando} className="btn-primary w-full">
            {salvando ? 'Salvando…' : 'Cadastrar produto'}
          </button>
        </form>
      </div>
    </AppLayout>
  )
}
