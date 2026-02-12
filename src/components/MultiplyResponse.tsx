import { useState, useRef } from "react";
import iconChartSimple from "../assets/icons/chart-simple.svg";
import iconChartHorizontal from "../assets/icons/chart-simple-horizontal.svg";
import iconCircleQuarter from "../assets/icons/circle-quarter.svg";
import Dropdown from "./Dropdown";

type ChartType = "vertical" | "horizontal" | "donut";
type DatePeriod = "Last 30 days" | "Last 3 months" | "Last 6 months" | "All time";

interface ChoiceData {
  letter: string;
  label: string;
  value: number;
}

const CHOICES: ChoiceData[] = [
  { letter: "A", label: "What we gonna do today", value: 12 },
  { letter: "B", label: "I think we should try play basketball", value: 13 },
  { letter: "C", label: "Well, I probably agree with you", value: 50 },
  { letter: "D", label: "Definetely", value: 25 },
];

const DONUT_COLORS = ["#1966CA", "#6B4FBB", "#2DB88A", "#E5AA28"];

const TOTAL_RESPONSES = 480;

function QuestionIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M6 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1ZM5.5 8.5a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0ZM6 3.5c-.83 0-1.5.67-1.5 1.5a.5.5 0 0 0 1 0c0-.28.22-.5.5-.5s.5.22.5.5c0 .18-.07.27-.33.47l-.1.08C5.83 5.71 5.5 6.04 5.5 6.75a.5.5 0 0 0 1 0c0-.18.07-.27.33-.47l.1-.08C7.17 5.54 7.5 5.21 7.5 4.5 7.5 3.67 6.83 3 6 3.5Z"
        fill="#9E9D98"
      />
    </svg>
  );
}

// Tooltip component
function Tooltip({
  option,
  responses,
  share,
  period,
  style,
}: {
  option: string;
  responses: number;
  share: string;
  period: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="absolute z-50 w-[180px] rounded-lg border-[0.5px] border-[rgba(0,0,0,0.12)]"
      style={style}
    >
      <div className="bg-white flex flex-col gap-0.5 px-1.5 py-2 rounded-lg shadow-[0px_8px_16px_rgba(0,0,0,0.04),0px_1px_2px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2 rounded-[6px] pl-1 pr-2 py-1">
          <span className="flex-1 text-xs font-normal leading-3 text-text-secondary truncate">Option</span>
          <span className="text-xs font-medium leading-3 text-title-secondary text-right">{option}</span>
        </div>
        <div className="flex items-center gap-2 rounded-[6px] pl-1 pr-2 py-1">
          <span className="flex-1 text-xs font-normal leading-3 text-text-secondary truncate">Responces:</span>
          <span className="text-xs font-medium leading-3 text-title-secondary text-right">{responses}</span>
        </div>
        <div className="flex items-center gap-2 rounded-[6px] pl-1 pr-2 py-1">
          <span className="flex-1 text-xs font-normal leading-3 text-text-secondary truncate">Share:</span>
          <span className="text-xs font-medium leading-3 text-title-secondary text-right">{share}</span>
        </div>
        <div className="flex items-center rounded-[6px] pl-1 pr-2 py-1">
          <span className="flex-1 text-xs font-normal leading-3 text-text-caption truncate">{period}</span>
        </div>
      </div>
    </div>
  );
}

// Vertical Bar Chart
function VerticalBarChart({
  choices,
  hoveredIndex,
  onHover,
}: {
  choices: ChoiceData[];
  hoveredIndex: number | null;
  onHover: (i: number | null) => void;
}) {
  const maxVal = Math.max(...choices.map((c) => c.value));
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex gap-8 h-[156px] items-end w-full relative">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-black/8" />
        {choices.map((choice, i) => {
          const heightPct = (choice.value / maxVal) * 100;
          return (
            <div
              key={i}
              className={`flex flex-1 h-full items-end justify-center cursor-pointer rounded-sm transition-colors ${
                hoveredIndex === i ? "bg-[rgba(48,46,42,0.04)]" : ""
              }`}
              onMouseEnter={() => onHover(i)}
              onMouseLeave={() => onHover(null)}
            >
              <div
                className="w-6 bg-brand-accent rounded-t-[4px] transition-all"
                style={{ height: `${heightPct}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-8 w-full">
        {choices.map((choice, i) => (
          <div key={i} className="flex-1 text-center text-sm font-normal text-text-secondary">
            {choice.value}%
          </div>
        ))}
      </div>
    </div>
  );
}

// Horizontal Bar Chart
function HorizontalBarChart({
  choices,
  hoveredIndex,
  onHover,
}: {
  choices: ChoiceData[];
  hoveredIndex: number | null;
  onHover: (i: number | null) => void;
}) {
  const maxVal = Math.max(...choices.map((c) => c.value));
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-1 w-full relative">
        <div className="absolute left-0 top-0 bottom-[-6px] w-px bg-black/8" />
        {choices.map((choice, i) => {
          const widthPct = (choice.value / maxVal) * 100;
          return (
            <div
              key={i}
              className={`flex flex-col items-start py-2.5 w-full cursor-pointer rounded-sm transition-colors ${
                hoveredIndex === i ? "bg-[rgba(48,46,42,0.04)]" : ""
              }`}
              onMouseEnter={() => onHover(i)}
              onMouseLeave={() => onHover(null)}
            >
              <div className="flex items-center" style={{ width: `${widthPct}%` }}>
                <div className="flex-1 h-4 bg-brand-accent rounded-r-[4px]" />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-8 w-full">
        {[0, 25, 50, 75].map((v) => (
          <div key={v} className="flex-1 text-sm font-normal text-text-secondary">
            {v}
          </div>
        ))}
      </div>
    </div>
  );
}

// Donut Chart
function DonutChart({
  choices,
  hoveredIndex,
  onHover,
}: {
  choices: ChoiceData[];
  hoveredIndex: number | null;
  onHover: (i: number | null) => void;
}) {
  const total = choices.reduce((sum, c) => sum + c.value, 0);
  const radius = 50;
  const strokeWidth = 14;
  const center = 60;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;
  const segments = choices.map((choice, i) => {
    const pct = choice.value / total;
    const dashLength = pct * circumference;
    const gap = circumference - dashLength;
    const offset = -cumulativeOffset;
    cumulativeOffset += dashLength;
    return { dashLength, gap, offset, color: DONUT_COLORS[i], index: i };
  });

  return (
    <div className="flex items-center justify-center w-full h-full">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {segments.map((seg) => (
          <circle
            key={seg.index}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={hoveredIndex === seg.index ? strokeWidth + 3 : strokeWidth}
            strokeDasharray={`${seg.dashLength} ${seg.gap}`}
            strokeDashoffset={seg.offset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${center} ${center})`}
            className="cursor-pointer transition-all"
            onMouseEnter={() => onHover(seg.index)}
            onMouseLeave={() => onHover(null)}
          />
        ))}
      </svg>
    </div>
  );
}

export default function MultiplyResponse() {
  const [chartType, setChartType] = useState<ChartType>("vertical");
  const [period, setPeriod] = useState<DatePeriod>("Last 30 days");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mouseY, setMouseY] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);

  const chartTypes: { type: ChartType; icon: string }[] = [
    { type: "vertical", icon: iconChartSimple },
    { type: "horizontal", icon: iconChartHorizontal },
    { type: "donut", icon: iconCircleQuarter },
  ];

  const periods: DatePeriod[] = ["Last 30 days", "Last 3 months", "Last 6 months", "All time"];

  return (
    <div className="bg-white border border-border rounded-xl shadow-[0px_2px_4px_rgba(0,0,0,0.04)] flex flex-col gap-4 overflow-hidden pt-4 px-4 pb-6 w-[764px] relative">
      {/* Header */}
      <div className="flex items-center justify-between pl-2">
        <div className="flex gap-2 items-center">
          <span className="text-sm font-semibold text-title-secondary leading-4">
            Multiply Response
          </span>
          <div className="bg-surface-secondary flex items-center p-0.5 rounded-full">
            <QuestionIcon />
          </div>
        </div>

        <div className="flex gap-2 items-center">
          {/* Segmented Control */}
          <div className="flex items-center border border-black/12 rounded-md shadow-[0px_0.5px_2px_rgba(0,0,0,0.16)] overflow-hidden">
            {chartTypes.map(({ type, icon }) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`flex items-center justify-center p-1.5 border-r border-[#e6e6e5] last:border-r-0 transition-colors ${
                  chartType === type ? "bg-[#f7f7f6]" : "bg-white"
                }`}
              >
                <img src={icon} alt="" className="w-4 h-4" style={{ opacity: chartType === type ? 1 : 0.5 }} />
              </button>
            ))}
          </div>

          {/* Date Filter Dropdown */}
          <Dropdown value={period} options={periods} onChange={setPeriod} />
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-6 items-center w-full">
        {/* Left: Choices */}
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <div className="flex flex-col gap-1">
            {CHOICES.map((choice, i) => (
              <div
                key={i}
                className={`flex flex-col items-start pl-2.5 pr-4 py-2 rounded-lg transition-colors cursor-pointer ${
                  hoveredIndex === i ? "bg-[rgba(48,46,42,0.04)]" : ""
                }`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex gap-3 items-center w-full">
                  <div className="bg-[rgba(115,114,108,0.12)] flex items-center justify-center rounded-sm w-4 h-4 shrink-0">
                    <span className="text-xs font-semibold text-text-secondary leading-4">
                      {choice.letter}
                    </span>
                  </div>
                  <span className="flex-1 text-base font-normal text-title-secondary leading-5 truncate">
                    {choice.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center px-2 h-4">
            <span className="text-sm font-normal text-text-caption leading-4">
              Based on {TOTAL_RESPONSES} responces
            </span>
          </div>
        </div>

        {/* Right: Chart */}
        <div
          ref={chartRef}
          className="flex flex-1 items-center justify-center relative"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setMouseY(e.clientY - rect.top);
          }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {chartType === "vertical" && (
            <VerticalBarChart
              choices={CHOICES}
              hoveredIndex={hoveredIndex}
              onHover={setHoveredIndex}
            />
          )}
          {chartType === "horizontal" && (
            <HorizontalBarChart
              choices={CHOICES}
              hoveredIndex={hoveredIndex}
              onHover={setHoveredIndex}
            />
          )}
          {chartType === "donut" && (
            <DonutChart
              choices={CHOICES}
              hoveredIndex={hoveredIndex}
              onHover={setHoveredIndex}
            />
          )}
          {hoveredIndex !== null && chartRef.current && (() => {
            const container = chartRef.current!;
            const cw = container.offsetWidth;
            const ch = container.offsetHeight;
            const count = CHOICES.length;
            const barCenterX = ((hoveredIndex + 0.5) / count) * cw;
            const tooltipW = 180;
            const tooltipH = 110;
            const left = Math.max(0, Math.min(barCenterX - tooltipW / 2, cw - tooltipW));
            const top = Math.max(0, Math.min(mouseY + 12, ch - tooltipH));
            return (
              <Tooltip
                option={CHOICES[hoveredIndex].letter}
                responses={Math.round((CHOICES[hoveredIndex].value / 100) * TOTAL_RESPONSES)}
                share={`${CHOICES[hoveredIndex].value}%`}
                period={period}
                style={{ left, top, pointerEvents: "none" }}
              />
            );
          })()}
        </div>
      </div>
    </div>
  );
}
