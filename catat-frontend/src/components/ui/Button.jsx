import * as React from "react"
import { cn } from "../../lib/utils"

const buttonVariants = {
  primary: "bg-primary-500 text-white hover:bg-primary-600",
  secondary: "bg-secondary-500 text-white hover:bg-secondary-600",
  outline: "border-2 border-primary-500 text-primary-500 hover:bg-primary-50",
  ghost: "hover:bg-gray-100 text-gray-700",
  danger: "bg-red-500 text-white hover:bg-red-600"
}

const sizeVariants = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-6 text-base",
  lg: "h-14 px-8 text-lg",
  icon: "h-11 w-11"
}

const Button = React.forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md", 
  disabled,
  children,
  ...props 
}, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        sizeVariants[size],
        className
      )}
      ref={ref}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = "Button"

export { Button }