export function Progress({ value = 0, className = "" }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-secondary ${className}`}>
      <div
        className="h-full bg-primary transition-all duration-200"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  )
}

