export default function ProgressBar({ percentual = 0 }) {
  const valor = Math.max(0, Math.min(100, percentual))
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-concrete-100">
      <div
        className="h-full rounded-full bg-roque-blue-700 transition-all duration-300 ease-out"
        style={{ width: `${valor}%` }}
        role="progressbar"
        aria-valuenow={valor}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
}
