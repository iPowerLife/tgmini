export function Progress({ value, className = "" }) {
  return (
    <div className={`relative h-4 w-full overflow-hidden rounded-full bg-gray-700 ${className}`}>
      <div
        className="h-full w-full flex-1 bg-blue-500 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  )
}

