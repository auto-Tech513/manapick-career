import type { ComponentProps } from "react";
/** AI ToolCard surface contract. Domain-specific card content stays with its site. */
export function NetworkCard({ className = "", ...props }: ComponentProps<"article">) {
  return <article {...props} className={`mp-card ${className}`} />;
}
