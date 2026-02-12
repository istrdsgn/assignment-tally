import { useState, useRef, useEffect } from "react";

interface QuestionBadgeProps {
  title: string;
  description: string;
}

export default function QuestionBadge({ title, description }: QuestionBadgeProps) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShow(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div
        className="bg-[#f5f5f5] hover:bg-[#ebebeb] flex items-center p-[2px] rounded-full cursor-pointer transition-colors"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M5.95 9.5H5.955M4.06 3.85C4.33 3.06 5.07 2.5 5.95 2.5C7.05 2.5 7.95 3.4 7.95 4.5C7.95 5.33 7.44 6.04 6.73 6.34C6.36 6.5 6.17 6.58 6.11 6.64C6.03 6.71 6.02 6.73 5.98 6.83C5.95 6.91 5.95 7.04 5.95 7.3L5.95 8"
            stroke="#73726C"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {show && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 border-[0.5px] border-[rgba(0,0,0,0.12)] rounded-lg"
          style={{ pointerEvents: "none" }}
        >
          <div className="bg-white flex flex-col gap-1 px-4 py-3 rounded-lg shadow-[0px_8px_16px_rgba(0,0,0,0.04),0px_1px_2px_rgba(0,0,0,0.08)] w-[248px]">
            <span className="text-xs font-medium text-[#444444] leading-[18px] tracking-[0.24px]">
              {title}
            </span>
            <span className="text-xs font-normal text-[#9E9D98] leading-[18px] tracking-[0.24px]">
              {description}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
