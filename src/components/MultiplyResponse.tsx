import { useState, useRef } from "react";
import iconChartSimple from "../assets/icons/chart-simple.svg";
import iconChartHorizontal from "../assets/icons/chart-simple-horizontal.svg";
import iconCircleQuarter from "../assets/icons/circle-quarter.svg";
import Dropdown from "./Dropdown";
import QuestionBadge from "./QuestionBadge";

type ChartType = "vertical" | "horizontal" | "donut";
type DatePeriod = "Last 30 days" | "Last 3 months" | "Last 6 months" | "All time";

interface ChoiceData {
  letter: string;
  label: string;
  value: number;
}

const LABELS = [
  { letter: "A", label: "What we gonna do today" },
  { letter: "B", label: "I think we should try play basketball" },
  { letter: "C", label: "Well, I probably agree with you" },
  { letter: "D", label: "Definetely" },
];

const DATA_BY_PERIOD: Record<DatePeriod, { values: number[]; total: number }> = {
  "Last 30 days": { values: [12, 13, 50, 25], total: 480 },
  "Last 3 months": { values: [18, 22, 38, 22], total: 1240 },
  "Last 6 months": { values: [15, 28, 32, 25], total: 2680 },
  "All time": { values: [20, 20, 35, 25], total: 4120 },
};

function getChoices(period: DatePeriod): ChoiceData[] {
  const d = DATA_BY_PERIOD[period];
  return LABELS.map((l, i) => ({ ...l, value: d.values[i] }));
}

const DONUT_COLORS = ["#1966CA", "#6B4FBB", "#27A674", "#F37A3A"];

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
                className="w-4 bg-brand-accent rounded-t-[4px] transition-all"
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
              <div className="flex items-center transition-all duration-300" style={{ width: `${widthPct}%` }}>
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
  const center = 72;
  const radius = 54;
  const strokeWidth = 18;
  const gapAngle = 3; // degrees gap between segments

  // Build arc segments
  const totalGap = gapAngle * choices.length;
  const availableDeg = 360 - totalGap;

  let currentAngle = -90; // start from top
  const arcs = choices.map((choice, i) => {
    const sweepDeg = (choice.value / total) * availableDeg;
    const startRad = (currentAngle * Math.PI) / 180;
    const endRad = ((currentAngle + sweepDeg) * Math.PI) / 180;
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    const largeArc = sweepDeg > 180 ? 1 : 0;
    const d = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
    currentAngle += sweepDeg + gapAngle;
    return { d, color: DONUT_COLORS[i], index: i };
  });

  return (
    <div className="flex items-center justify-center w-full h-full">
      <svg width="144" height="144" viewBox="0 0 144 144">
        {arcs.map((arc) => (
          <path
            key={arc.index}
            d={arc.d}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            opacity={hoveredIndex !== null && hoveredIndex !== arc.index ? 0.4 : 1}
            className="cursor-pointer transition-opacity duration-200"
            onMouseEnter={() => onHover(arc.index)}
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

  const choices = getChoices(period);
  const totalResponses = DATA_BY_PERIOD[period].total;

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
          <QuestionBadge
            title="Multiple Choice Question"
            description="A question where respondents select one or more answers from a predefined list of options."
          />
        </div>

        <div className="flex gap-2 items-center">
          {/* Segmented Control */}
          <div className="border-[0.5px] border-[rgba(0,0,0,0.12)] rounded-md w-fit">
            <div className="flex items-center rounded-md shadow-[0px_0.5px_2px_rgba(0,0,0,0.16)] overflow-hidden h-7">
              {chartTypes.map(({ type, icon }) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`flex items-center justify-center p-1.5 h-full border-r border-[#e6e6e5] last:border-r-0 transition-colors ${
                    chartType === type ? "bg-[#f7f7f6]" : "bg-white hover:bg-[#f7f7f6]"
                  }`}
                >
                  <img src={icon} alt="" className="w-[14px] h-[14px]" style={{ opacity: chartType === type ? 1 : 0.5 }} />
                </button>
              ))}
            </div>
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
            {choices.map((choice, i) => (
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
              Based on {totalResponses} responces
            </span>
          </div>
        </div>

        {/* Right: Chart */}
        <div
          ref={chartRef}
          className="flex flex-1 h-[188px] items-center justify-center relative"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setMouseY(e.clientY - rect.top);
          }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {chartType === "vertical" && (
            <VerticalBarChart
              choices={choices}
              hoveredIndex={hoveredIndex}
              onHover={setHoveredIndex}
            />
          )}
          {chartType === "horizontal" && (
            <HorizontalBarChart
              choices={choices}
              hoveredIndex={hoveredIndex}
              onHover={setHoveredIndex}
            />
          )}
          {chartType === "donut" && (
            <DonutChart
              choices={choices}
              hoveredIndex={hoveredIndex}
              onHover={setHoveredIndex}
            />
          )}
          {hoveredIndex !== null && chartRef.current && (() => {
            const container = chartRef.current!;
            const cw = container.offsetWidth;
            const ch = container.offsetHeight;
            const count = choices.length;
            const barCenterX = ((hoveredIndex + 0.5) / count) * cw;
            const tooltipW = 180;
            const tooltipH = 110;
            // Stick to left or right edge based on bar position
            const left = barCenterX < cw / 2
              ? Math.min(barCenterX + 20, cw - tooltipW)
              : Math.max(0, barCenterX - tooltipW - 20);
            const top = Math.max(0, Math.min(mouseY + 12, ch - tooltipH));
            return (
              <Tooltip
                option={choices[hoveredIndex].letter}
                responses={Math.round((choices[hoveredIndex].value / 100) * totalResponses)}
                share={`${choices[hoveredIndex].value}%`}
                period={period}
                style={{ left, top, pointerEvents: "none", transition: "left 0.15s ease, top 0.1s ease" }}
              />
            );
          })()}
        </div>
      </div>
    </div>
  );
}
