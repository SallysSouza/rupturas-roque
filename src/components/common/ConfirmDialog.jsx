import { AlertTriangle } from 'lucide-react'

/**
 * Diálogo de confirmação reutilizável.
 * Usado em: excluir produto, excluir ruptura, sair do login.
 */
export default function ConfirmDialog({
  aberto,
  titulo,
  descricao,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  destrutivo = false,
  carregando = false,
  onConfirmar,
  onCancelar,
}) {
  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-concrete-950/50" onClick={onCancelar} />
      <div className="card relative w-full max-w-sm p-6">
        <div className="flex items-start gap-3">
          {destrutivo && (
            <div className="rounded-full bg-signal-red/10 p-2 text-signal-red">
              <AlertTriangle size={20} />
            </div>
          )}
          <div>
            <h3 className="font-display font-bold text-concrete-900">{titulo}</h3>
            {descricao && <p className="mt-1 text-sm text-concrete-500">{descricao}</p>}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-ghost" onClick={onCancelar} disabled={carregando}>
            {textoCancelar}
          </button>
          <button
            className={destrutivo ? 'btn-danger !bg-signal-red !text-white hover:!bg-signal-red/90' : 'btn-primary'}
            onClick={onConfirmar}
            disabled={carregando}
          >
            {carregando ? 'Aguarde…' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}
