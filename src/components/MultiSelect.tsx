import { useState, useRef, useEffect } from "react";

type Option = {
  value: string;
  label: string;
};

interface MultiSelectProps {
  name: string;
  options: Option[];
  value: string[];
  onChange: (val: string[]) => void;
}

const MultiSelect = ({ name, options, value, onChange }: MultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = Array.isArray(value) ? value : [];

  const toggleOption = (val: string) => {
    let newSelected: string[];
    if (selected.includes(val)) {
      newSelected = selected.filter((s) => s !== val);
    } else {
      newSelected = [...selected, val];
    }
    onChange(Array.from(new Set(newSelected)));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", minWidth: 200 }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          border: "1px solid #ccc",
          padding: "8px",
          cursor: "pointer",
          borderRadius: 4,
          background: "black",
        }}
      >
        {selected.length > 0
          ? options
              .filter((o) => selected.includes(o.value))
              .map((o) => o.label)
              .join(", ")
          : "Selecione..."}
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            border: "1px solid #ccc",
            background: "black",
            zIndex: 10,
            borderRadius: 4,
            maxHeight: 150,
            overflowY: "auto",
          }}
        >
          {options.map((opt) => (
            <label
              key={opt.value}
              style={{
                display: "block",
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggleOption(opt.value)}
                style={{ marginRight: 6 }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
