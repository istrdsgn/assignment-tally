import { useState, useRef } from "react";
import Dropdown from "./Dropdown";

type ViewMode = "overview" | "detailed";
type DetailedTab = "histogram" | "trend";
type DatePeriod = "Last 30 days" | "Last 3 months" | "Last 6 months" | "All time";

const CSAT_SCORE = 72;
const MEDIAN = 4;
const AVERAGE = 4.2;
const TOTAL_RESPONSES = 480;
const PURPLE = "#A52E9D";

const RATINGS = [
  { score: 5, responses: 16 },
  { score: 4, responses: 12 },
  { score: 3, responses: 8 },
  { score: 2, responses: 2 },
  { score: 1, responses: 4 },
];

const HISTOGRAM_DATA = [
  { score: 1, value: 4 },
  { score: 2, value: 2 },
  { score: 3, value: 8 },
  { score: 4, value: 12 },
  { score: 5, value: 16 },
];

const TREND_DATA = Array.from({ length: 31 }, (_, i) => ({
  label: `Mar ${i + 1}`,
  csat: 10 + Math.floor(Math.random() * 70),
  responses: 5 + Math.floor(Math.random() * 25),
}));

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

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 1.5l1.76 3.57 3.94.57-2.85 2.78.67 3.93L8 10.67l-3.52 1.68.67-3.93L2.3 5.64l3.94-.57L8 1.5z"
        stroke="#9E9D98"
        strokeWidth="1"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function GaugeChart({ score }: { score: number }) {
  const angle = (score / 100) * 180;
  const r = 60;
  const cx = 72;
  const cy = 65;

  const arcPath = (startAngle: number, endAngle: number) => {
    const s = (startAngle * Math.PI) / 180;
    const e = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(Math.PI + s);
    const y1 = cy + r * Math.sin(Math.PI + s);
    const x2 = cx + r * Math.cos(Math.PI + e);
    const y2 = cy + r * Math.sin(Math.PI + e);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <div className="flex flex-col items-center">
      <svg width="144" height="80" viewBox="0 0 144 80">
        <path d={arcPath(0, 180)} fill="none" stroke="#E8E8E8" strokeWidth="12" strokeLinecap="round" />
        <path d={arcPath(0, angle)} fill="none" stroke={PURPLE} strokeWidth="12" strokeLinecap="round" />
        <circle
          cx={cx + (r - 2) * Math.cos(Math.PI + (angle * Math.PI) / 180)}
          cy={cy + (r - 2) * Math.sin(Math.PI + (angle * Math.PI) / 180)}
          r="4"
          fill="#302E2A"
        />
      </svg>
      <div className="flex flex-col items-center -mt-4">
        <span className="text-xs font-normal text-title-secondary">CSAT</span>
        <span className="text-[28px] font-semibold text-black leading-8">{score}%</span>
      </div>
    </div>
  );
}

function Tooltip({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      className="absolute z-50 w-[180px] rounded-lg border-[0.5px] border-[rgba(0,0,0,0.12)]"
      style={style}
    >
      <div className="bg-white flex flex-col gap-0.5 px-1.5 py-2 rounded-lg shadow-[0px_8px_16px_rgba(0,0,0,0.04),0px_1px_2px_rgba(0,0,0,0.08)]">{children}</div>
    </div>
  );
}

function TooltipRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-2 rounded-[6px] pl-1 pr-2 py-1">
      <span className="flex-1 text-xs font-normal leading-3 text-text-secondary truncate">{label}</span>
      <span className="text-xs font-medium leading-3 text-title-secondary text-right">{value}</span>
    </div>
  );
}

function TooltipCaption({ text }: { text: string }) {
  return (
    <div className="flex items-center rounded-[6px] pl-1 pr-2 py-1">
      <span className="flex-1 text-xs font-normal leading-3 text-text-caption truncate">{text}</span>
    </div>
  );
}

function OverviewView() {
  const maxResponses = Math.max(...RATINGS.map((r) => r.responses));
  return (
    <div className="flex gap-6 items-center w-full">
      <div className="flex flex-1 flex-col h-[176px] justify-between overflow-hidden">
        <div className="flex flex-col pl-2" style={{ gap: "12px" }}>
          {RATINGS.map((rating) => {
            const barWidth = (rating.responses / maxResponses) * 140;
            return (
              <div key={rating.score} className="flex gap-3 items-center w-full h-4">
                <StarIcon />
                <span className="text-sm font-normal text-title-secondary w-3">{rating.score}</span>
                <div
                  className="h-2 rounded-r"
                  style={{ width: `${barWidth}px`, backgroundColor: PURPLE }}
                />
                <span className="text-sm font-normal text-text-secondary ml-auto">{rating.responses} responces</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center px-2 h-4">
          <span className="text-sm font-normal text-text-caption">Based on {TOTAL_RESPONSES} responces</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 items-center justify-center pt-6">
        <GaugeChart score={CSAT_SCORE} />
        <div className="flex gap-2 items-center justify-center">
          <div className="flex gap-3 items-center justify-center px-2.5 py-1">
            <span className="text-sm font-normal text-text-secondary">Median:</span>
            <span className="text-base font-medium text-title-secondary">{MEDIAN}</span>
          </div>
          <div className="w-px h-6 bg-black/12" />
          <div className="flex gap-3 items-center justify-center px-2.5 py-1">
            <span className="text-sm font-normal text-text-secondary">Average:</span>
            <span className="text-base font-medium text-title-secondary">{AVERAGE}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistogramView({ period }: { period: string }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mouseY, setMouseY] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const maxVal = Math.max(...HISTOGRAM_DATA.map((d) => d.value));

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-4 items-end px-2 w-full">
        <div className="flex gap-2 items-center w-full">
          <div className="flex flex-col h-[120px] justify-between w-8 text-xs font-normal text-text-secondary shrink-0">
            <span>100</span>
            <span>50</span>
            <span>0</span>
          </div>
          <div
            ref={chartRef}
            className="flex flex-1 h-[120px] items-end relative"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setMouseY(e.clientY - rect.top);
            }}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="h-px bg-black/8 w-full border-dashed border-t border-black/8" />
              <div className="h-px bg-black/8 w-full border-dashed border-t border-black/8" />
              <div className="h-px bg-black/8 w-full" />
            </div>
            {HISTOGRAM_DATA.map((d, i) => {
              const heightPct = (d.value / maxVal) * 100;
              return (
                <div
                  key={i}
                  className={`flex flex-1 h-full items-end justify-center cursor-pointer transition-colors ${
                    hoveredIdx === i ? "bg-[rgba(48,46,42,0.04)]" : ""
                  }`}
                  onMouseEnter={() => setHoveredIdx(i)}
                >
                  <div
                    className="w-4 rounded-t transition-all"
                    style={{ height: `${heightPct}%`, backgroundColor: PURPLE }}
                  />
                </div>
              );
            })}
            {hoveredIdx !== null && chartRef.current && (() => {
              const cw = chartRef.current!.offsetWidth;
              const ch = chartRef.current!.offsetHeight;
              const count = HISTOGRAM_DATA.length;
              const barCenterX = ((hoveredIdx + 0.5) / count) * cw;
              const tooltipW = 180;
              const left = Math.max(0, Math.min(barCenterX - tooltipW / 2, cw - tooltipW));
              const top = Math.max(0, Math.min(mouseY + 12, ch - 100));
              return (
                <Tooltip style={{ left, top, pointerEvents: "none" }}>
                  <TooltipRow label="Responces:" value={HISTOGRAM_DATA[hoveredIdx].value} />
                  <TooltipRow label="Share:" value={`${Math.round((HISTOGRAM_DATA[hoveredIdx].value / TOTAL_RESPONSES) * 100)}%`} />
                  <TooltipCaption text={period} />
                </Tooltip>
              );
            })()}
          </div>
        </div>
        <div className="flex items-center w-full">
          <div className="w-8 shrink-0" />
          <div className="flex flex-1">
            {HISTOGRAM_DATA.map((d, i) => (
              <div key={i} className="flex-1 text-center text-xs font-normal text-text-secondary">
                {d.score}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendView() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mouseY, setMouseY] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const maxCsat = Math.max(...TREND_DATA.map((d) => d.csat));
  const labelIndices = [0, 6, 13, 20, 27];

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-4 items-end px-2 w-full">
        <div className="flex gap-2 items-center w-full">
          <div className="flex flex-col h-[120px] justify-between w-8 text-xs font-normal text-text-secondary shrink-0">
            <span>100</span>
            <span>50</span>
            <span>0</span>
          </div>
          <div
            ref={chartRef}
            className="flex flex-1 h-[120px] items-end gap-px relative"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setMouseY(e.clientY - rect.top);
            }}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="h-px bg-black/8 w-full" />
              <div className="h-px bg-black/8 w-full" />
              <div className="h-px bg-black/8 w-full" />
            </div>
            {TREND_DATA.map((d, i) => {
              const heightPct = (d.csat / maxCsat) * 100;
              return (
                <div
                  key={i}
                  className={`flex flex-1 h-full items-end justify-center cursor-pointer transition-colors ${
                    hoveredIdx === i ? "bg-[rgba(48,46,42,0.04)]" : ""
                  }`}
                  onMouseEnter={() => setHoveredIdx(i)}
                >
                  <div
                    className="w-full rounded-t-sm"
                    style={{ height: `${heightPct}%`, backgroundColor: PURPLE }}
                  />
                </div>
              );
            })}
            {hoveredIdx !== null && chartRef.current && (() => {
              const cw = chartRef.current!.offsetWidth;
              const ch = chartRef.current!.offsetHeight;
              const count = TREND_DATA.length;
              const barCenterX = ((hoveredIdx + 0.5) / count) * cw;
              const tooltipW = 180;
              const left = Math.max(0, Math.min(barCenterX - tooltipW / 2, cw - tooltipW));
              const top = Math.max(0, Math.min(mouseY + 12, ch - 100));
              return (
                <Tooltip style={{ left, top, pointerEvents: "none" }}>
                  <TooltipRow label="CSAT:" value={`${TREND_DATA[hoveredIdx].csat}%`} />
                  <TooltipRow label="Responces:" value={TREND_DATA[hoveredIdx].responses} />
                  <TooltipCaption text={TREND_DATA[hoveredIdx].label} />
                </Tooltip>
              );
            })()}
          </div>
        </div>
        <div className="flex items-center w-full">
          <div className="w-8 shrink-0" />
          <div className="flex flex-1">
            {TREND_DATA.map((d, i) => (
              <div key={i} className="flex-1 text-center text-xs font-normal text-text-secondary">
                {labelIndices.includes(i) ? d.label : ""}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CsatScore() {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [detailedTab, setDetailedTab] = useState<DetailedTab>("histogram");
  const [period, setPeriod] = useState<DatePeriod>("Last 30 days");

  const viewOptions = ["Overview", "Detailed"] as const;
  type ViewLabel = typeof viewOptions[number];
  const viewLabel: ViewLabel = viewMode === "overview" ? "Overview" : "Detailed";
  const handleViewChange = (v: ViewLabel) => setViewMode(v === "Overview" ? "overview" : "detailed");

  const periods: DatePeriod[] = ["Last 30 days", "Last 3 months", "Last 6 months", "All time"];
  const tabs: { key: DetailedTab; label: string }[] = [
    { key: "histogram", label: "Histogram" },
    { key: "trend", label: "Trend" },
  ];

  return (
    <div className="bg-white border border-border rounded-xl shadow-[0px_2px_4px_rgba(0,0,0,0.04)] flex flex-col gap-4 overflow-hidden pt-4 px-4 pb-6 w-[764px] relative">
      {/* Header */}
      <div className="flex items-center justify-between pl-2">
        <div className="flex gap-2 items-center">
          <span className="text-sm font-semibold text-title-secondary leading-4">Customer Satisfaction Score</span>
          <div className="bg-surface-secondary flex items-center p-0.5 rounded-full">
            <QuestionIcon />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Dropdown value={viewLabel} options={[...viewOptions]} onChange={handleViewChange} />
          <Dropdown value={period} options={periods} onChange={setPeriod} />
        </div>
      </div>

      {viewMode === "detailed" && (
        <div className="px-2 pb-3">
          <div className="flex items-center border border-black/12 rounded-md shadow-[0px_0.5px_2px_rgba(0,0,0,0.16)] overflow-hidden w-fit h-7">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setDetailedTab(tab.key)}
                className={`px-3 py-1.5 text-sm font-normal border-r border-[#e6e6e5] last:border-r-0 transition-colors ${
                  detailedTab === tab.key
                    ? "bg-[#f7f7f6] text-title-primary"
                    : "bg-white text-text-secondary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {viewMode === "overview" && <OverviewView />}
      {viewMode === "detailed" && detailedTab === "histogram" && <HistogramView period={period} />}
      {viewMode === "detailed" && detailedTab === "trend" && <TrendView />}
    </div>
  );
}
