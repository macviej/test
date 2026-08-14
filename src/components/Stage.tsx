import type { ReactNode } from "react";

type Props = {
  id?: string | number;
  children: ReactNode;
  className?: string;
};

export function Stage({ id, children, className = "" }: Props) {
  return (
    <div key={id} className={`animate-stage-in ${className}`}>
      {children}
    </div>
  );
}
