export function Button({ children, className = "", variant = "default", ...props }) {
  const baseStyles = "px-4 py-2 rounded-lg transition-all duration-300 font-medium flex items-center justify-center"

  const variantStyles = {
    default:
      "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/80 hover:to-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 border-none",
    outline:
      "bg-gradient-to-r from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20 border-blue-500/20 hover:border-blue-500/30 text-blue-500",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  }

  const disabledStyles = props.disabled ? "opacity-50 cursor-not-allowed" : "transform hover:-translate-y-0.5"

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${className}`} {...props}>
      {children}
    </button>
  )
}

