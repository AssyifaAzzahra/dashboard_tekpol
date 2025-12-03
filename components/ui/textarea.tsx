import * as React from "react";
import clsx from "clsx";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={clsx(
        "w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
