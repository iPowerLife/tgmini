export function WarningMessage({ message }) {
  return (
    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
      <div className="flex items-start">
        <div className="text-yellow-500 mr-2">⚠️</div>
        <div className="text-sm text-gray-300">{message}</div>
      </div>
    </div>
  )
}

