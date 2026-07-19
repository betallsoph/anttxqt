import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-[6px] whitespace-nowrap text-sm font-bold ring-offset-white gap-2 cursor-pointer disabled:pointer-events-none disabled:opacity-50 touch-manipulation",
    {
        variants: {
            variant: {
                default:
                    "btn-neo-primary text-black bg-blue-300 border-2 border-black shadow-primary",
                secondary:
                    "btn-neo-secondary text-black bg-white border-2 border-black shadow-primary",
                toolbar:
                    "toolbar-action btn-neo-tap-secondary text-black bg-blue-300 border-2 border-black shadow-secondary transition-[transform,box-shadow]",
                action:
                    "modal-action btn-neo-tap-secondary text-black bg-blue-300 border-2 border-black shadow-secondary transition-[transform,box-shadow]",
                oppositeDefault:
                    "btn-neo-secondary text-black bg-white border-2 border-black shadow-primary",
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

const actionHoverVariants = new Set(["toolbar", "action"])

function setHoverOrigin(event: React.PointerEvent<HTMLButtonElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty("--hover-x", `${event.clientX - bounds.left}px`)
    event.currentTarget.style.setProperty("--hover-y", `${event.clientY - bounds.top}px`)
}

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, children, onPointerEnter, onPointerMove, ...props }, ref) => {
        const hasActionHover = variant != null && actionHoverVariants.has(variant)

        const handlePointerEnter = (event: React.PointerEvent<HTMLButtonElement>) => {
            if (hasActionHover && !props.disabled) {
                setHoverOrigin(event)
            }
            onPointerEnter?.(event)
        }

        const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
            if (hasActionHover && !props.disabled) {
                setHoverOrigin(event)
            }
            onPointerMove?.(event)
        }

        const content = hasActionHover ? (
            <span className={variant === "toolbar" ? "toolbar-action-label" : "modal-action-label"}>
                {children}
            </span>
        ) : (
            children
        )

        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                onPointerEnter={handlePointerEnter}
                onPointerMove={handlePointerMove}
                {...props}
            >
                {content}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
