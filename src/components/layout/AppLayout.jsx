import Sidebar from './Sidebar.jsx'

export default function AppLayout({ titulo, acoes, children }) {
  return (
    <div className="min-h-screen bg-concrete-50 lg:flex">
      <Sidebar />
      <div className="flex-1 lg:pl-0">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-concrete-200 bg-white/80 px-5 py-4 pl-16 backdrop-blur lg:pl-8">
          <h1 className="font-display text-lg font-bold text-concrete-900 sm:text-xl">{titulo}</h1>
          {acoes && <div className="flex shrink-0 items-center gap-2">{acoes}</div>}
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
