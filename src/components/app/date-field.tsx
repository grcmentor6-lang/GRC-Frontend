"use client";

import { useState } from "react";
import { isoDmy, parseDate } from "@/lib/dates";
import { Icon } from "@/components/ui/icon";

/**
 * A date the learner can type or pick, always shown as DD-MMM-YYYY (05-OCT-2026). `value` and `onChange` are ISO
 * "YYYY-MM-DD" ("" when empty), so what a page stores does not change. The calendar button is the browser's own picker.
 */
export function DateField({ value, onChange, min, max, disabled, readOnly, required, className = "", "aria-label": label, "aria-invalid": invalid }: {
  value: string; onChange: (iso: string) => void; min?: string; max?: string; disabled?: boolean; readOnly?: boolean; required?: boolean; className?: string; "aria-label"?: string; "aria-invalid"?: boolean;
}) {
  const [text, setText] = useState<string | null>(null); // what is being typed; null = show the value
  const bad = text !== null && text.trim() !== "" && parseDate(text) === null;
  const commit = () => {
    if (text === null) return;
    const iso = text.trim() === "" ? "" : parseDate(text);
    if (iso !== null) { onChange(iso); setText(null); } else onChange(""); // never leave the last good date behind a bad entry
  };
  return (
    <span className="relative flex items-center">
      <input
        type="text"
        inputMode="text"
        autoComplete="off"
        placeholder="05-OCT-2026"
        value={text ?? isoDmy(value)}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        aria-label={label}
        aria-invalid={invalid || bad}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        className={`min-w-0 flex-1 tabular-nums ${className}`}
      />
      {!disabled && !readOnly && (
        <span className="relative mr-2 grid h-8 w-8 shrink-0 place-items-center text-[#5B6474]">
          <Icon name="calendar" size={16} />
          <input
            type="date"
            tabIndex={-1}
            aria-label={`${label ?? "Date"}: pick from a calendar`}
            value={/^\d{4}-\d{2}-\d{2}$/.test(value) ? value : ""}
            min={min}
            max={max}
            onChange={(e) => { setText(null); onChange(e.target.value); }}
            className="absolute inset-0 cursor-pointer opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
        </span>
      )}
      {bad && <span className="sr-only" role="alert">Not a date. Write it as 05-OCT-2026.</span>}
    </span>
  );
}
