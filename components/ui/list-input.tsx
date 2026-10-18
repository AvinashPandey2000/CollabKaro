"use client";
import { useId, useState } from "react";
import { Check, Plus, X } from "lucide-react";

// A short editable list (e.g. a brief's do's and don'ts). Enter or "Add" adds
// the typed item; suggestion chips add a common one in one tap.
export function ListInput({
  label,
  values,
  onChange,
  tone,
  placeholder,
  suggestions = [],
  max = 10,
  maxLength = 140,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  tone: "do" | "dont";
  placeholder: string;
  suggestions?: string[];
  max?: number;
  maxLength?: number;
}) {
  const id = useId();
  const [text, setText] = useState("");
  const add = (item: string) => {
    const clean = item.trim().slice(0, maxLength);
    if (clean.length < 2 || values.length >= max) return;
    if (values.some((v) => v.toLowerCase() === clean.toLowerCase())) return;
    onChange([...values, clean]);
    setText("");
  };
  const Icon = tone === "do" ? Check : X;
  const unused = suggestions.filter(
    (s) => !values.some((v) => v.toLowerCase() === s.toLowerCase()),
  );
  return (
    <div className={`field list-input ${tone}`}>
      <span id={`${id}-label`}>
        {label}
        <small className="muted">
          {values.length}/{max}
        </small>
      </span>
      {values.length > 0 && (
        <ul aria-labelledby={`${id}-label`}>
          {values.map((v, i) => (
            <li key={v}>
              <Icon size={15} aria-hidden />
              <span>{v}</span>
              <button
                type="button"
                className="icon-button"
                aria-label={`Remove “${v}”`}
                onClick={() => onChange(values.filter((_, j) => j !== i))}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {values.length < max && (
        <div className="list-input-add">
          <input
            aria-label={`Add to ${label.toLowerCase()}`}
            placeholder={placeholder}
            value={text}
            maxLength={maxLength}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add(text);
              }
            }}
          />
          <button
            type="button"
            className="button secondary small"
            disabled={text.trim().length < 2}
            onClick={() => add(text)}
          >
            <Plus size={15} />
            Add
          </button>
        </div>
      )}
      {unused.length > 0 && values.length < max && (
        <div className="quick-add" aria-label={`Common ${label.toLowerCase()}`}>
          {unused.map((s) => (
            <button key={s} type="button" onClick={() => add(s)}>
              <Plus size={13} />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
