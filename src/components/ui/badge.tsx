import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline:
          "text-foreground border-border",
        success:
          "border-transparent bg-success text-success-foreground",
        accent:
          "border-transparent bg-accent text-accent-foreground",
        // Funding type badges
        isa:
          "bg-primary/10 text-primary border-primary/20 font-medium",
        scholarship:
          "bg-secondary/10 text-secondary border-secondary/20 font-medium",
        grant:
          "bg-accent/20 text-accent-foreground border-accent/30 font-medium",
        // Status badges
        active:
          "bg-success/10 text-success border-success/20",
        pending:
          "bg-accent/20 text-accent-foreground border-accent/30",
        completed:
          "bg-muted text-muted-foreground border-border",
        // Category badges
        category:
          "bg-muted text-muted-foreground border-border hover:bg-muted/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
