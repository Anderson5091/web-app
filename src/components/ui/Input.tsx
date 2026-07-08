import React, { useState } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  valid?: boolean;
}

export default function Input({
  label,
  error,
  valid,
  id,
  type,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="w-full text-left mb-4">
      {label ? (
        <label htmlFor={id} className="block text-text-secondary text-sm font-medium mb-1.5">
          {label}
        </label>
      ) : null}
      <div className={`flex items-center bg-card border ${error ? "border-danger" : valid ? "border-primary" : "border-border"} rounded-md px-4 h-[52px] transition-colors focus-within:border-primary`}>
        <input
          id={id}
          type={isPassword && showPassword ? "text" : type}
          className="flex-1 bg-transparent text-text-primary placeholder-text-subtle text-base outline-none"
          {...props}
        />
        {valid && !error && (
          <CheckCircle size={20} className="text-primary shrink-0" />
        )}
        {isPassword && (
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-1 text-text-subtle hover:text-text-secondary">
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error ? (
        <div className="flex items-center gap-1 mt-1">
          <AlertCircle size={13} className="text-danger" />
          <p className="text-xs text-danger font-medium">{error}</p>
        </div>
      ) : null}
    </div>
  );
}
