import { useState, useRef, useEffect } from "react";
function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 6l4 4 4-4" stroke="#73726C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckmarkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 9" fill="none">
      <path d="M0.625 4.19L3.497 7.042L9.958 0.625" stroke="#444444" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface DropdownProps<T extends string> {
  value: T;
  options: T[];
  onChange: (value: T) => void;
}

export default function Dropdown<T extends string>({ value, options, onChange }: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setHoveredIdx(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex gap-[5px] items-center pl-3 pr-2 py-1.5 rounded-md hover:bg-black/4 transition-colors"
      >
        <span className="text-sm font-normal text-[#73726C] leading-4">{value}</span>
        <ChevronDownIcon />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 border-[0.5px] border-[rgba(0,0,0,0.12)] rounded-lg z-50">
          <div className="bg-white flex flex-col gap-[2px] p-[6px] rounded-lg shadow-[0px_8px_16px_rgba(0,0,0,0.08),0px_1px_2px_rgba(0,0,0,0.08)] min-w-[164px]">
            {options.map((option, i) => {
              const isSelected = option === value;
              const isHovered = hoveredIdx === i;
              return (
                <button
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                    setHoveredIdx(null);
                  }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`flex gap-2 items-center w-full px-2 py-1.5 text-sm font-normal text-[#302E2A] rounded-md transition-colors truncate ${
                    isHovered && !isSelected ? "bg-[#f5f5f5]" : ""
                  }`}
                >
                  <span className="flex-1 text-left truncate leading-4">{option}</span>
                  {isSelected && (
                    <span className="shrink-0"><CheckmarkIcon /></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
