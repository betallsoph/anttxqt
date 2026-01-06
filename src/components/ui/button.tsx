import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-[6px] whitespace-nowrap text-sm font-bold ring-offset-white transition-all gap-2 cursor-pointer disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "text-black bg-blue-300 border-2 border-black shadow-primary hover:translate-x-[5px] hover:translate-y-[5px] hover:shadow-none",
                oppositeDefault:
                    "text-black bg-white border-2 border-black shadow-primary hover:translate-x-[5px] hover:translate-y-[5px] hover:shadow-none",
                oppositeNoShadow:
                    "text-blue-400 bg-white border-2 border-blue-400 hover:bg-blue-400 hover:text-white transition-all duration-500",
                noShadow:
                    "text-black bg-blue-300 border-2 border-black hover:bg-blue-400 transition-all duration-500",
                ghost:
                    "text-black hover:bg-blue-100 transition-all duration-300",
                link:
                    "text-blue-500 underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 px-3",
                lg: "h-12 px-8 text-base",
                icon: "size-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
