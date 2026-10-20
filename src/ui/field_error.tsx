import { DetailedHTMLProps, HTMLAttributes } from "react";

export default function FieldError({ children, className, ...props }: DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>) {
  if (!children) return null;
  return (
    <span className={`${className} block text-sm text-danger-700`} role="alert" {...props}>
      {children}
    </span>
  );
}
