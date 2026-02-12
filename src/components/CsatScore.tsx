import { useState, useRef } from "react";
import Dropdown from "./Dropdown";
import QuestionBadge from "./QuestionBadge";

type ViewMode = "overview" | "detailed";
type DetailedTab = "histogram" | "trend";
type DatePeriod = "Last 30 days" | "Last 3 months" | "Last 6 months" | "All time";

const PURPLE = "#A52E9D";

function csatSeeded(seed: number) {
  return () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

interface CsatPeriodData {
  score: number;
  median: number;
  average: number;
  total: number;
  ratings: { score: number; responses: number }[];
  histogram: { score: number; value: number }[];
  trend: { label: string; csat: number; responses: number }[];
}

function generateCsatData(seed: number, month: string, baseScore: number): CsatPeriodData {
  const rng = csatSeeded(seed);
  const ratings = [5, 4, 3, 2, 1].map(s => ({
    score: s,
    responses: 2 + Math.floor(rng() * 20),
  }));
  const histogram = [1, 2, 3, 4, 5].map(s => ({
    score: s,
    value: 2 + Math.floor(rng() * 18),
  }));
  const total = ratings.reduce((s, r) => s + r.responses, 0);
  const trend = Array.from({ length: 31 }, (_, i) => ({
    label: `${month} ${i + 1}`,
    csat: 30 + Math.floor(rng() * 50),
    responses: 5 + Math.floor(rng() * 25),
  }));
  return {
    score: baseScore,
    median: Math.round((3 + rng() * 2) * 10) / 10,
    average: Math.round((3 + rng() * 2) * 10) / 10,
    total, ratings, histogram, trend,
  };
}

const CSAT_DATA: Record<DatePeriod, CsatPeriodData> = {
  "Last 30 days": generateCsatData(55, "Mar", 72),
  "Last 3 months": generateCsatData(88, "Jan", 68),
  "Last 6 months": generateCsatData(144, "Oct", 75),
  "All time": generateCsatData(777, "Jun", 70),
};

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
  // Matches Figma: viewBox 0 0 144 72, center (72,72), r=64, stroke=16
  const cx = 72;
  const cy = 72;
  const r = 64;
  const sw = 16;
  const pct = score / 100;

  // Background: full semicircle from left (8,72) to right (136,72)
  const bgArc = `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`;

  // Value: from right side going counter-clockwise (matching Figma direction)
  const angle = Math.PI * (1 - pct);
  const ex = cx + r * Math.cos(angle);
  const ey = cy - r * Math.sin(angle);
  const large = pct > 0.5 ? 1 : 0;
  const valArc = `M ${cx + r} ${cy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;

  return (
    <div className="flex flex-col items-center relative" style={{ width: 144, height: 108 }}>
      <svg width="144" height="72" viewBox="0 0 144 72">
        <path d={bgArc} fill="none" stroke="#EFEFEF" strokeWidth={sw} />
        <path d={valArc} fill="none" stroke={PURPLE} strokeWidth={sw} />
      </svg>
      <div className="absolute flex flex-col items-center" style={{ top: 56, left: "50%", transform: "translateX(-50%)" }}>
        <span className="text-xs font-normal leading-3 text-title-secondary">CSAT</span>
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

function OverviewView({ data }: { data: CsatPeriodData }) {
  const maxResponses = Math.max(...data.ratings.map((r) => r.responses));
  return (
    <div className="flex gap-6 items-center w-full">
      <div className="flex flex-1 flex-col h-[176px] justify-between overflow-hidden">
        <div className="flex flex-col pl-2" style={{ gap: "12px" }}>
          {data.ratings.map((rating) => {
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
          <span className="text-sm font-normal text-text-caption">Based on {data.total} responces</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 items-center justify-center pt-6">
        <GaugeChart score={data.score} />
        <div className="flex gap-2 items-center justify-center">
          <div className="flex gap-3 items-center justify-center px-2.5 py-1">
            <span className="text-sm font-normal text-text-secondary">Median:</span>
            <span className="text-base font-medium text-title-secondary">{data.median}</span>
          </div>
          <div className="w-px h-6 bg-black/12" />
          <div className="flex gap-3 items-center justify-center px-2.5 py-1">
            <span className="text-sm font-normal text-text-secondary">Average:</span>
            <span className="text-base font-medium text-title-secondary">{data.average}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistogramView({ period, data }: { period: string; data: CsatPeriodData }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mouseY, setMouseY] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const maxVal = Math.max(...data.histogram.map((d) => d.value));

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
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
              <div className="w-full" style={{ height: 0, borderTop: "1px dashed rgba(0,0,0,0.08)" }} />
              <div className="w-full" style={{ height: 0, borderTop: "1px dashed rgba(0,0,0,0.08)" }} />
              <div className="w-full" style={{ height: 0, borderTop: "1px dashed rgba(0,0,0,0.08)" }} />
            </div>
            {data.histogram.map((d, i) => {
              const heightPct = (d.value / maxVal) * 100;
              return (
                <div
                  key={i}
                  className={`relative z-10 flex flex-1 h-full items-end justify-center cursor-pointer transition-colors ${
                    hoveredIdx === i ? "bg-[rgba(48,46,42,0.04)]" : ""
                  }`}
                  onMouseEnter={() => setHoveredIdx(i)}
                >
                  <div
                    className="w-4 rounded-t transition-all duration-300"
                    style={{ height: `${heightPct}%`, backgroundColor: PURPLE }}
                  />
                </div>
              );
            })}
            {hoveredIdx !== null && chartRef.current && (() => {
              const cw = chartRef.current!.offsetWidth;
              const ch = chartRef.current!.offsetHeight;
              const count = data.histogram.length;
              const barCenterX = ((hoveredIdx + 0.5) / count) * cw;
              const tooltipW = 180;
              const left = Math.max(0, Math.min(barCenterX - tooltipW / 2, cw - tooltipW));
              const top = Math.max(0, Math.min(mouseY + 12, ch - 100));
              return (
                <Tooltip style={{ left, top, pointerEvents: "none" }}>
                  <TooltipRow label="Responces:" value={data.histogram[hoveredIdx].value} />
                  <TooltipRow label="Share:" value={`${Math.round((data.histogram[hoveredIdx].value / data.total) * 100)}%`} />
                  <TooltipCaption text={period} />
                </Tooltip>
              );
            })()}
          </div>
        </div>
        <div className="flex items-center w-full">
          <div className="w-8 shrink-0" />
          <div className="flex flex-1">
            {data.histogram.map((d, i) => (
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

function TrendView({ data }: { data: CsatPeriodData }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mouseY, setMouseY] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const maxCsat = Math.max(...data.trend.map((d) => d.csat));
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
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
              <div className="w-full" style={{ height: 0, borderTop: "1px dashed rgba(0,0,0,0.08)" }} />
              <div className="w-full" style={{ height: 0, borderTop: "1px dashed rgba(0,0,0,0.08)" }} />
              <div className="w-full" style={{ height: 0, borderTop: "1px dashed rgba(0,0,0,0.08)" }} />
            </div>
            {data.trend.map((d, i) => {
              const heightPct = (d.csat / maxCsat) * 100;
              return (
                <div
                  key={i}
                  className={`relative z-10 flex flex-1 h-full items-end justify-center cursor-pointer transition-colors ${
                    hoveredIdx === i ? "bg-[rgba(48,46,42,0.04)]" : ""
                  }`}
                  onMouseEnter={() => setHoveredIdx(i)}
                >
                  <div
                    className="w-2 mx-auto rounded-t-sm transition-all duration-300"
                    style={{ height: `${heightPct}%`, backgroundColor: PURPLE }}
                  />
                </div>
              );
            })}
            {hoveredIdx !== null && chartRef.current && (() => {
              const cw = chartRef.current!.offsetWidth;
              const ch = chartRef.current!.offsetHeight;
              const count = data.trend.length;
              const barCenterX = ((hoveredIdx + 0.5) / count) * cw;
              const tooltipW = 180;
              const left = Math.max(0, Math.min(barCenterX - tooltipW / 2, cw - tooltipW));
              const top = Math.max(0, Math.min(mouseY + 12, ch - 100));
              return (
                <Tooltip style={{ left, top, pointerEvents: "none" }}>
                  <TooltipRow label="CSAT:" value={`${data.trend[hoveredIdx].csat}%`} />
                  <TooltipRow label="Responces:" value={data.trend[hoveredIdx].responses} />
                  <TooltipCaption text={data.trend[hoveredIdx].label} />
                </Tooltip>
              );
            })()}
          </div>
        </div>
        <div className="flex items-center w-full">
          <div className="w-8 shrink-0" />
          <div className="flex flex-1">
            {data.trend.map((d, i) => (
              <div key={i} className="flex-1 text-center text-xs font-normal text-text-secondary whitespace-nowrap">
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

  const data = CSAT_DATA[period];
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
          <QuestionBadge
            title="Customer Satisfaction Score"
            description="A metric that measures how satisfied customers are with a product, service, or experience."
          />
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
                    : "bg-white text-text-secondary hover:bg-[#f7f7f6]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {viewMode === "overview" && <OverviewView data={data} />}
      {viewMode === "detailed" && detailedTab === "histogram" && <HistogramView period={period} data={data} />}
      {viewMode === "detailed" && detailedTab === "trend" && <TrendView data={data} />}
    </div>
  );
}
