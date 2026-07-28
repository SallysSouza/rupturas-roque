import { useState } from 'react'
import { Search, PackagePlus, CheckCircle2 } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout.jsx'
import { useDebounce } from '../hooks/useDebounce.js'
import { useProdutosPaginados } from '../hooks/useProdutosPaginados.js'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext.jsx'
import { LOJAS } from '../lib/lojas.js'

export default function RegistrarRuptura() {
  const { perfil } = useAuth()
  const [loja, setLoja] = useState(perfil?.loja || LOJAS[0])
  const [termo, setTermo] = useState('')
  const termoDebounced = useDebounce(termo, 300)
  const { produtos, carregando, temMais, carregarMais } = useProdutosPaginados(termoDebounced)

  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [observacao, setObservacao] = useState('')
  const [estoqueDisponivel, setEstoqueDisponivel] = useState('0')
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState(null)

  const [avisandoSemCadastro, setAvisandoSemCadastro] = useState(false)
  const [descricaoInformada, setDescricaoInformada] = useState('')

  async function avisarProdutoSemCadastro(e) {
    e.preventDefault()
    if (!descricaoInformada.trim()) return
    await supabase.from('produtos_sem_cadastro').insert({
      descricao_informada: descricaoInformada.trim(),
      status: 'pendente',
      loja,
      data_hora: new Date().toISOString(),
      criado_por: perfil?.id,
      criado_por_nome: perfil?.nome,
    })
    setMensagem({
      tipo: 'ok',
      texto: 'Enviado para o comprador cadastrar. Assim que cadastrado, você poderá registrar a ruptura.',
    })
    setDescricaoInformada('')
    setAvisandoSemCadastro(false)
    setTermo('')
  }

  async function registrar(e) {
    e.preventDefault()
    setEnviando(true)
    setMensagem(null)
    try {
      const { error } = await supabase.from('rupturas').insert({
        produto_codigo: produtoSelecionado.codigo,
        produto_descricao: produtoSelecionado.descricao,
        departamento: produtoSelecionado.departamento,
        fornecedor: produtoSelecionado.fornecedor,
        loja,
        estoque_disponivel: Number(estoqueDisponivel) || 0,
        observacao,
        status: 'Em análise',
        data_hora: new Date().toISOString(),
        criado_por: perfil?.id,
        criado_por_nome: perfil?.nome,
      })
      if (error) throw error
      setMensagem({ tipo: 'ok', texto: `Ruptura de "${produtoSelecionado.descricao}" registrada.` })
      setProdutoSelecionado(null)
      setObservacao('')
      setEstoqueDisponivel('0')
      setTermo('')
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: 'Não foi possível registrar. Tente novamente.' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AppLayout titulo="Registrar Ruptura">
      <div className="mx-auto max-w-2xl">
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

        {!produtoSelecionado ? (
          <div className="card p-5">
            <label className="label" htmlFor="loja">
              Loja
            </label>
            <select id="loja" className="input mb-4" value={loja} onChange={(e) => setLoja(e.target.value)}>
              {LOJAS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>

            <label className="label" htmlFor="busca">
              Pesquisar Produto
            </label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-500" />
              <input
                id="busca"
                className="input pl-10"
                placeholder="Código, descrição, departamento ou subcategoria…"
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
              />
            </div>

            <div className="mt-4 max-h-96 divide-y divide-concrete-100 overflow-y-auto rounded-xl border border-concrete-200">
              {produtos.map((p) => (
                <button
                  key={p.codigo}
                  onClick={() => setProdutoSelecionado(p)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-concrete-50"
                >
                  <span>
                    <span className="font-medium text-concrete-900">{p.descricao}</span>
                    <span className="block text-xs text-concrete-500">
                      {p.codigo} · {p.departamento || 'sem departamento'}
                    </span>
                  </span>
                </button>
              ))}
              {!carregando && termoDebounced && produtos.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-concrete-500">
                  Nenhum produto encontrado para "{termoDebounced}".
                </p>
              )}
              {carregando && <p className="px-4 py-4 text-center text-sm text-concrete-500">Buscando…</p>}
              {temMais && !carregando && (
                <button onClick={carregarMais} className="w-full py-3 text-sm font-medium text-roque-blue-700 hover:bg-concrete-50">
                  Carregar mais resultados
                </button>
              )}
            </div>

            {!avisandoSemCadastro ? (
              <button
                onClick={() => {
                  setDescricaoInformada(termo)
                  setAvisandoSemCadastro(true)
                }}
                className="mt-3 text-sm font-medium text-roque-blue-700 hover:underline"
              >
                Não encontrou o produto? Avisar o comprador
              </button>
            ) : (
              <form onSubmit={avisarProdutoSemCadastro} className="mt-3 rounded-xl border border-concrete-200 p-4">
                <label className="label">Descreva o produto que não achou</label>
                <input
                  className="input mb-3"
                  value={descricaoInformada}
                  onChange={(e) => setDescricaoInformada(e.target.value)}
                  placeholder="Ex: Cimento branco 5kg"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button type="button" className="btn-ghost" onClick={() => setAvisandoSemCadastro(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Enviar ao comprador
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <form onSubmit={registrar} className="card p-6">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-concrete-500">Produto selecionado</p>
            <p className="mb-1 font-display text-lg font-bold text-roque-blue-950">{produtoSelecionado.descricao}</p>
            <p className="mb-5 text-sm text-concrete-500">Loja: {loja}</p>

            <label className="label" htmlFor="estoque">
              Estoque disponível
            </label>
            <input
              id="estoque"
              type="number"
              min="0"
              className="input mb-4"
              value={estoqueDisponivel}
              onChange={(e) => setEstoqueDisponivel(e.target.value)}
            />

            <label className="label" htmlFor="obs">
              Observação
            </label>
            <textarea
              id="obs"
              className="input mb-5 min-h-24"
              placeholder="Ex: cliente procurando diariamente"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />

            <div className="flex gap-2">
              <button type="button" className="btn-ghost" onClick={() => setProdutoSelecionado(null)}>
                Trocar produto
              </button>
              <button type="submit" disabled={enviando} className="btn-primary ml-auto">
                <PackagePlus size={16} />
                {enviando ? 'Registrando…' : 'Registrar ruptura'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  )
}
