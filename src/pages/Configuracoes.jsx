import AppLayout from '../components/layout/AppLayout.jsx'

export default function Configuracoes() {
  return (
    <AppLayout titulo="Configurações">
      <div className="card max-w-xl p-6">
        <h2 className="mb-2 font-display font-bold text-concrete-900">Configurações gerais</h2>
        <p className="text-sm text-concrete-500">
          Esta tela é o ponto de partida para preferências do sistema (ex: tamanho de lote de importação, canais de
          notificação, integrações). Nenhuma opção configurável foi especificada ainda — me diga o que deve entrar
          aqui e eu implemento.
        </p>
      </div>
    </AppLayout>
  )
}
