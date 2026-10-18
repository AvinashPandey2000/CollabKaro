"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Plus, Search } from "lucide-react";

type Option = string | { value: string; label: string };

// A dropdown with a search box on top, for long option lists
// (cities, niches, languages, campaigns). Short lists keep the native select.
export function SearchSelect({
  value,
  onChange,
  options,
  placeholder,
  label,
  className = "",
  allowCustom = false,
  multiple = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  /** Label for the empty value, e.g. "All cities". Omit when a value is required. */
  placeholder?: string;
  /** Field name used for the accessible name, e.g. "City". */
  label?: string;
  className?: string;
  /** Let people type a value that isn't in the list ("Other"). */
  allowCustom?: boolean;
  /** Tick several options; the value is joined as "A, B, C" and "" means the placeholder (all). */
  multiple?: boolean;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [up, setUp] = useState(false);

  const picked = multiple
    ? value
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
    : [];
  const listed = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );
  // Typed-in picks aren't in the options, so list them up top where they can be unticked.
  const typedPicks = picked
    .filter((p) => !listed.some((o) => o.value === p))
    .map((p) => ({ value: p, label: p }));
  const all = [
    ...(placeholder !== undefined ? [{ value: "", label: placeholder }] : []),
    ...typedPicks,
    ...listed,
  ];
  const q = query.trim().toLowerCase();
  const shown = q ? all.filter((o) => o.label.toLowerCase().includes(q)) : all;
  const current = all.find((o) => o.value === value);
  const isOn = (v: string) =>
    multiple ? (v ? picked.includes(v) : picked.length === 0) : v === value;
  const summary = multiple
    ? picked.length
      ? picked.join(", ")
      : (placeholder ?? "")
    : (current?.label ?? value);
  const typed = query.trim();
  // An extra last row that uses the typed text as the value.
  const custom =
    allowCustom &&
    typed &&
    !all.some((o) => o.label.toLowerCase() === typed.toLowerCase())
      ? typed
      : "";
  const count = shown.length + (custom ? 1 : 0);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const close = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const show = () => {
    // Open upward when there isn't room for the list below the trigger.
    const r = trigger.current?.getBoundingClientRect();
    setUp(
      !!r && innerHeight - r.bottom < 320 && r.top > innerHeight - r.bottom,
    );
    setQuery("");
    setActive(
      Math.max(
        0,
        all.findIndex((o) => o.value === value),
      ),
    );
    setOpen(true);
  };
  const pick = (v: string) => {
    if (multiple) {
      // Commas separate values, so strip them from typed entries.
      const item = v.replace(/,/g, " ").trim();
      onChange(
        !item
          ? ""
          : picked.includes(item)
            ? picked.filter((p) => p !== item).join(", ")
            : [...picked, item].join(", "),
      );
      // Stay open so several options can be ticked in a row.
      setQuery("");
      input.current?.focus();
      return;
    }
    onChange(v);
    setOpen(false);
    trigger.current?.focus();
  };

  return (
    <div className={`search-select ${className}`} ref={root}>
      <button
        type="button"
        ref={trigger}
        className="search-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label ? `${label}: ${summary}` : undefined}
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
          className={`search-select-panel ${multiple ? "multi" : ""} ${up ? "up" : ""}`}
          onClick={(e) => e.preventDefault()}
        >
          <div className="search-select-input">
            <Search size={15} aria-hidden />
            <input
              ref={input}
              role="combobox"
              aria-expanded
              aria-controls={`${id}-list`}
              aria-activedescendant={
                active < count ? `${id}-${active}` : undefined
              }
              aria-label={`Search ${label ? label.toLowerCase() : "options"}`}
              placeholder={allowCustom ? "Search or type your own…" : "Search…"}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((a) => Math.min(a + 1, count - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((a) => Math.max(a - 1, 0));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  if (shown[active]) pick(shown[active].value);
                  else if (custom) pick(custom);
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setOpen(false);
                  trigger.current?.focus();
                } else if (e.key === "Tab") setOpen(false);
              }}
            />
          </div>
          <ul
            role="listbox"
            id={`${id}-list`}
            aria-label={label}
            aria-multiselectable={multiple || undefined}
          >
            {shown.map((o, i) => (
              <li
                key={o.value || "__all"}
                id={`${id}-${i}`}
                role="option"
                aria-selected={isOn(o.value)}
                className={`${i === active ? "active" : ""} ${multiple && !o.value ? "all" : ""}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(o.value)}
              >
                {multiple && (
                  <span className="multi-check" aria-hidden>
                    {isOn(o.value) && <Check size={12} />}
                  </span>
                )}
                <span>{o.label}</span>
                {!multiple && o.value === value && (
                  <Check size={14} aria-hidden />
                )}
              </li>
            ))}
            {custom && (
              <li
                id={`${id}-${shown.length}`}
                role="option"
                aria-selected={false}
                className={`search-select-custom ${active === shown.length ? "active" : ""}`}
                onMouseEnter={() => setActive(shown.length)}
                onClick={() => pick(custom)}
              >
                <span>
                  <Plus size={14} aria-hidden /> Use “{custom}”
                </span>
              </li>
            )}
            {allowCustom && !typed && (
              <li className="search-select-empty">
                Not listed? Type it above to add it.
              </li>
            )}
            {shown.length === 0 && !custom && (
              <li className="search-select-empty">No matches for “{query}”</li>
            )}
          </ul>
          {multiple && <small className="multi-hint">Pick one or more</small>}
        </div>
      )}
    </div>
  );
}
