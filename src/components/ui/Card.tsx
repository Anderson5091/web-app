import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`bg-card rounded-xl border border-border p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
