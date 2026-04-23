import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[44px] min-w-[44px]",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-white hover:bg-accent/90",
        destructive: "bg-error text-white hover:bg-error/90",
        outline:
          "border border-gray-200 bg-background hover:bg-muted",
        secondary: "bg-muted text-primary hover:bg-muted/80",
        ghost: "hover:bg-muted",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    if (asChild && props.children) {
      const child = React.Children.only(props.children);
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<{ className?: string }>, {
          className: cn(
            buttonVariants({ variant, size, className }),
            (child as React.ReactElement<{ className?: string }>).props?.className
          ),
          ref,
        });
      }
    }
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
