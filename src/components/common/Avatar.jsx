export default function Avatar({ nome, size = 40 }) {
  const iniciais = (nome || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-roque-gold-400 font-display font-bold text-roque-blue-950"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {iniciais || '?'}
    </div>
  )
}
