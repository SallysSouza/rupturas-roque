import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout.jsx'
import ConfirmDialog from '../components/common/ConfirmDialog.jsx'
import { supabase } from '../supabaseClient'

export default function Departamentos() {
  const [departamentos, setDepartamentos] = useState([])
  const [novo, setNovo] = useState('')
  const [emExclusao, setEmExclusao] = useState(null)

  async function carregar() {
    const { data } = await supabase.from('departamentos').select('nome').order('nome')
    setDepartamentos(data || [])
  }

  useEffect(() => {
    carregar()
  }, [])

  async function adicionar(e) {
    e.preventDefault()
    if (!novo.trim()) return
    await supabase.from('departamentos').upsert({ nome: novo.trim() }, { onConflict: 'nome' })
    setNovo('')
    carregar()
  }

  async function confirmarExclusao() {
    await supabase.from('departamentos').delete().eq('nome', emExclusao)
    setEmExclusao(null)
    carregar()
  }

  return (
    <AppLayout titulo="Departamentos">
      <div className="mx-auto max-w-lg">
        <form onSubmit={adicionar} className="mb-4 flex gap-2">
          <input className="input" placeholder="Novo departamento" value={novo} onChange={(e) => setNovo(e.target.value)} />
          <button type="submit" className="btn-primary shrink-0">
            <Plus size={16} />
            Adicionar
          </button>
        </form>

        <div className="card divide-y divide-concrete-100">
          {departamentos.map((d) => (
            <div key={d.nome} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-concrete-900">{d.nome}</span>
              <button className="rounded-lg p-2 text-signal-red hover:bg-signal-red/10" onClick={() => setEmExclusao(d.nome)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {departamentos.length === 0 && <p className="p-8 text-center text-sm text-concrete-500">Nenhum departamento cadastrado.</p>}
        </div>
      </div>

      <ConfirmDialog
        aberto={!!emExclusao}
        titulo="Excluir este departamento?"
        descricao="Produtos já cadastrados com esse departamento não serão alterados."
        textoConfirmar="Excluir"
        destrutivo
        onCancelar={() => setEmExclusao(null)}
        onConfirmar={confirmarExclusao}
      />
    </AppLayout>
  )
}
