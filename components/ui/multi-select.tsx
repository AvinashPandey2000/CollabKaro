"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

// Pick any number of options (e.g. platforms). The value is a comma-separated
// string so it drops straight into URL params; "" means "all".
export function MultiSelect({
  value,
  onChange,
  options,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  /** Shown when nothing (or everything) is picked, e.g. "All platforms". */
  placeholder: string;
  /** Field name used for the accessible name, e.g. "Platform". */
  label: string;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const [active, setActive] = useState(0);

  const picked = value ? value.split(",").filter(Boolean) : [];
  const all = picked.length === 0 || picked.length === options.length;
  const summary = all ? placeholder : picked.join(", ");
  // Row 0 is "All", rows 1..n are the options.
  const rows = [placeholder, ...options];

  useEffect(() => {
    if (!open) return;
    list.current?.focus();
    const close = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const show = () => {
    const r = trigger.current?.getBoundingClientRect();
    setUp(
      !!r && innerHeight - r.bottom < 260 && r.top > innerHeight - r.bottom,
    );
    setActive(0);
    setOpen(true);
  };
  // "All" means every option is ticked, so unticking one keeps the rest.
  const effective = all ? options : picked;
  const toggle = (row: number) => {
    if (row === 0) return onChange("");
    const o = options[row - 1];
    const next = effective.includes(o)
      ? effective.filter((p) => p !== o)
      : [...effective, o];
    // At least one option stays ticked; nothing ticked would hide everything.
    if (next.length === 0) return;
    // Keep the option order stable, and treat "every option" as "all".
    const ordered = options.filter((x) => next.includes(x));
    onChange(ordered.length === options.length ? "" : ordered.join(","));
  };
  const isOn = (row: number) =>
    row === 0 ? all : effective.includes(options[row - 1]);

  return (
    <div className="search-select" ref={root}>
      <button
        type="button"
        ref={trigger}
        className="search-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${summary}`}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            show();
          }
        }}
      >
        <span>{summary}</span>
        <ChevronDown size={15} aria-hidden />
      </button>
      {open && (
        // preventDefault stops a wrapping <label> from re-clicking the trigger.
        <div
          className={`search-select-panel multi ${up ? "up" : ""}`}
          onClick={(e) => e.preventDefault()}
        >
          <ul
            ref={list}
            role="listbox"
            id={`${id}-list`}
            aria-label={label}
            aria-multiselectable
            tabIndex={0}
            aria-activedescendant={`${id}-${active}`}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, rows.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                toggle(active);
              } else if (e.key === "Escape") {
                e.preventDefault();
                setOpen(false);
                trigger.current?.focus();
              } else if (e.key === "Tab") setOpen(false);
            }}
          >
            {rows.map((r, i) => (
              <li
                key={r}
                id={`${id}-${i}`}
                role="option"
                aria-selected={isOn(i)}
                className={`${i === active ? "active" : ""} ${i === 0 ? "all" : ""}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => toggle(i)}
              >
                <span className="multi-check" aria-hidden>
                  {isOn(i) && <Check size={12} />}
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <small className="multi-hint">Pick one or more</small>
        </div>
      )}
    </div>
  );
}
