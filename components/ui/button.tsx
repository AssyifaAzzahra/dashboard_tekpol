import * as React from "react";
import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "destructive" | "ghost";
};

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    default: "bg-black text-white hover:opacity-90",
    secondary: "bg-gray-200 text-black hover:bg-gray-300",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent hover:bg-gray-100",
  };
  return (
    <button
      className={clsx(
        "px-3 py-2 rounded-md text-sm transition disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
