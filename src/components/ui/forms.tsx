import type { InputHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "./icon";

export const inputCls =
  "w-full h-10 px-3 rounded-lg bg-white ring-1 ring-slate-200/80 text-[13.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-shadow";

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[12px] font-medium text-slate-700 tracking-tight">{label}</span>
        {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { icon?: IconName };

export function TextInput({ icon, className = "", ...props }: InputProps) {
  if (icon) {
    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icon name={icon} size={16} />
        </span>
        <input {...props} className={`${inputCls} pl-9 ${className}`} />
      </div>
    );
  }
  return <input {...props} className={`${inputCls} ${className}`} />;
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function PrimaryBtn({ children, className = "", ...props }: BtnProps) {
  return (
    <button
      {...props}
      className={`h-10 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-medium tracking-tight transition-colors shadow-sm ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostBtn({ children, className = "", ...props }: BtnProps) {
  return (
    <button
      {...props}
      className={`h-10 px-4 rounded-lg bg-white ring-1 ring-slate-200/80 hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-[13px] font-medium tracking-tight transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

export function Toggle({
  on,
  onChange,
  disabled,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange(!on)}
      className={`relative w-[38px] h-[22px] rounded-full transition-colors shrink-0 ${
        on ? "bg-indigo-600" : "bg-slate-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${on ? "translate-x-4" : ""}`}
      />
    </button>
  );
}
