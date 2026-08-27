import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

export interface SearchableSelectOption {
  id: string;
  label: string;
  sublabel?: string;
  iconUrl?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  loading?: boolean;
  emptyLabel?: string;
  disabledHint?: string;
  /** Overrides the default `input` trigger styling entirely when provided. */
  triggerClassName?: string;
  /** Overrides the default `file-card` dropdown panel styling entirely when provided. */
  menuClassName?: string;
}

/**
 * A searchable dropdown (combobox). Behaves like a native <select> for form
 * purposes (controlled value + onChange(id)) but renders a filterable list
 * so long option sets (districts, constituencies, etc.) stay easy to scan.
 */
export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  disabled = false,
  loading = false,
  emptyLabel = "No matches found",
  disabledHint,
  triggerClassName,
  menuClassName,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value) ?? null;

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q)
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (open) {
      setHighlighted(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    const el = listRef.current?.children[highlighted] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  function commit(id: string) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
    }
  }

  function handleListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[highlighted];
      if (opt) commit(opt.id);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${triggerClassName ?? "input"} flex items-center justify-between gap-2 w-full text-left ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <span className={`flex items-center gap-2 min-w-0 text-sm ${selected ? "text-ink" : "text-slateink"}`}>
          {selected?.iconUrl && (
            <img src={selected.iconUrl} alt="" className="w-4 h-4 rounded-sm object-contain shrink-0" />
          )}
          <span className="truncate">{loading ? "Loading..." : selected ? selected.label : placeholder}</span>
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-slateink transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {disabled && disabledHint && <p className="text-[11px] text-slateink mt-1">{disabledHint}</p>}

      {open && !disabled && (
        <div
          className={`absolute z-20 mt-1.5 w-full ${
            menuClassName ?? "file-card border border-ink/10 shadow-lg overflow-hidden"
          }`}
          onKeyDown={handleListKeyDown}
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b border-ink/8">
            <Search size={13} className="text-slateink shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm text-ink placeholder:text-slateink/60 outline-none"
            />
          </div>
          <div ref={listRef} role="listbox" className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-xs text-slateink">{emptyLabel}</p>
            ) : (
              filtered.map((opt, i) => (
                <button
                  key={opt.id}
                  type="button"
                  role="option"
                  aria-selected={opt.id === value}
                  onClick={() => commit(opt.id)}
                  onMouseEnter={() => setHighlighted(i)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors ${
                    i === highlighted ? "bg-ink/5" : ""
                  } ${opt.id === value ? "text-ink font-medium" : "text-ink/80"}`}
                >
                  <span className="flex items-center gap-2 min-w-0 truncate">
                    {opt.iconUrl && (
                      <img src={opt.iconUrl} alt="" className="w-4 h-4 rounded-sm object-contain shrink-0" />
                    )}
                    <span className="truncate">
                      {opt.label}
                      {opt.sublabel && <span className="text-slateink text-xs ml-1.5">· {opt.sublabel}</span>}
                    </span>
                  </span>
                  {opt.id === value && <Check size={14} className="text-banyan shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}