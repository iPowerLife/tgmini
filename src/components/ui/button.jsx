export function Button({ children, className = "", variant = "default", ...props }) {
  const baseStyles =
    "relative px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center transition-all duration-300"

  const variantStyles = {
    default:
      "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-xl",
    outline: "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 hover:border-blue-500/50",
    secondary: "bg-gray-800 text-white hover:bg-gray-700",
    ghost: "bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white",
    link: "text-blue-500 underline-offset-4 hover:underline bg-transparent",
  }

  const disabledStyles = props.disabled
    ? "opacity-50 cursor-not-allowed"
    : "transform hover:-translate-y-0.5 hover:shadow-lg"

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${className}`} {...props}>
      {children}
    </button>
  )
}

