import { useRef, useState } from 'react'
import { FileSpreadsheet, UploadCloud, CheckCircle2, AlertTriangle } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout.jsx'
import ProgressBar from '../../components/common/ProgressBar.jsx'
import { importarProdutosDaPlanilha } from '../../lib/importProdutos.js'

export default function Importar() {
  const inputRef = useRef(null)
  const [arquivo, setArquivo] = useState(null)
  const [progresso, setProgresso] = useState(null) // { processados, total, restante, percentual }
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')
  const [importando, setImportando] = useState(false)

  async function iniciarImportacao() {
    if (!arquivo) return
    setImportando(true)
    setErro('')
    setResultado(null)
    try {
      const resultado = await importarProdutosDaPlanilha(arquivo, {
        onProgresso: setProgresso,
      })
      setResultado(resultado)
    } catch (e) {
      setErro(e.message || 'Falha na importação.')
    } finally {
      setImportando(false)
    }
  }

  return (
    <AppLayout titulo="Importação por Planilha">
      <div className="mx-auto max-w-xl">
        <div className="card p-6">
          <p className="mb-4 text-sm text-concrete-500">
            Envie uma planilha (.xlsx ou .csv) com as colunas <strong>Código</strong> e <strong>Descrição</strong>.
            Fornecedor e Unidade são opcionais. A importação é feita em lotes, sem limite de linhas — suporta
            portfólios de 20.000+ produtos.
          </p>

          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => setArquivo(e.target.files?.[0] || null)}
          />

          <button
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-concrete-300 p-8 text-concrete-500 hover:border-roque-blue-500 hover:text-roque-blue-700"
            disabled={importando}
          >
            {arquivo ? <FileSpreadsheet size={28} /> : <UploadCloud size={28} />}
            <span className="text-sm font-medium">{arquivo ? arquivo.name : 'Clique para escolher o arquivo'}</span>
          </button>

          {progresso && (
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-sm text-concrete-700">
                <span>
                  {progresso.processados.toLocaleString('pt-BR')} de {progresso.total.toLocaleString('pt-BR')} produtos
                </span>
                <span className="font-semibold">{progresso.percentual}%</span>
              </div>
              <ProgressBar percentual={progresso.percentual} />
              <p className="mt-2 text-xs text-concrete-500">
                Restam {progresso.restante.toLocaleString('pt-BR')} produtos…
              </p>
            </div>
          )}

          {resultado && (
            <div className="mt-5 flex items-start gap-2 rounded-xl bg-signal-green/10 p-4 text-sm text-signal-green">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <span>
                Importação concluída: {resultado.importados.toLocaleString('pt-BR')} produtos processados.
                {resultado.ignoradas.length > 0 &&
                  ` ${resultado.ignoradas.length} linha(s) sem código/descrição foram ignoradas (linhas: ${resultado.ignoradas.slice(0, 10).join(', ')}${resultado.ignoradas.length > 10 ? '…' : ''}).`}
              </span>
            </div>
          )}

          {erro && (
            <div className="mt-5 flex items-start gap-2 rounded-xl bg-signal-red/10 p-4 text-sm text-signal-red">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          <button
            onClick={iniciarImportacao}
            disabled={!arquivo || importando}
            className="btn-primary mt-6 w-full"
          >
            {importando ? 'Importando…' : 'Iniciar importação'}
          </button>
        </div>
      </div>
    </AppLayout>
  )
}
