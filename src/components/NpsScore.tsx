import { useState, useRef } from "react";
import Dropdown from "./Dropdown";
import QuestionBadge from "./QuestionBadge";

type ViewMode = "overview" | "detailed";
type DetailedTab = "histogram" | "stacked" | "trend";
type DatePeriod = "Last 30 days" | "Last 3 months" | "Last 6 months" | "All time";

const BAR_COLORS: Record<string, string> = {
  detractor: "#D8D8D8",
  passive: "#FB813F",
  promoter: "#27A674",
};

// Seeded random for consistent data
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

interface NpsPeriodData {
  score: number;
  median: number;
  average: number;
  total: number;
  categories: { label: string; color: string; responses: number }[];
  histogram: { score: number; value: number; type: string }[];
  stacked: { label: string; promoters: number; passives: number; detractors: number; rawPromoters: number; rawPassives: number; rawDetractors: number; total: number }[];
  trend: { label: string; nps: number; responses: number }[];
}

function generateNpsData(seed: number, days: number, month: string, baseScore: number): NpsPeriodData {
  const rng = seeded(seed);
  const histogram = Array.from({ length: 10 }, (_, i) => {
    const type = i < 6 ? "detractor" : i < 8 ? "passive" : "promoter";
    return { score: i + 1, value: 5 + Math.floor(rng() * 70), type };
  });
  const det = histogram.filter(h => h.type === "detractor").reduce((s, h) => s + h.value, 0);
  const pas = histogram.filter(h => h.type === "passive").reduce((s, h) => s + h.value, 0);
  const pro = histogram.filter(h => h.type === "promoter").reduce((s, h) => s + h.value, 0);
  const total = det + pas + pro;

  const stacked = Array.from({ length: days }, (_, i) => {
    const p = 20 + Math.floor(rng() * 40);
    const pa = 10 + Math.floor(rng() * 20);
    const d = 5 + Math.floor(rng() * 15);
    const t = p + pa + d;
    return {
      label: `${month} ${i + 1}`,
      promoters: Math.round((p / t) * 100),
      passives: Math.round((pa / t) * 100),
      detractors: Math.round((d / t) * 100),
      rawPromoters: p, rawPassives: pa, rawDetractors: d, total: t,
    };
  });

  const trend = Array.from({ length: days }, (_, i) => ({
    label: `${month} ${i + 1}`,
    nps: 10 + Math.floor(rng() * 60),
    responses: 10 + Math.floor(rng() * 30),
  }));

  return {
    score: baseScore,
    median: Math.round((7 + rng() * 3) * 10) / 10,
    average: Math.round((7 + rng() * 3) * 10) / 10,
    total,
    categories: [
      { label: "Detractors", color: "#D8D8D8", responses: det },
      { label: "Passives", color: "#FB813F", responses: pas },
      { label: "Promoters", color: "#27A674", responses: pro },
    ],
    histogram, stacked, trend,
  };
}

const NPS_DATA: Record<DatePeriod, NpsPeriodData> = {
  "Last 30 days": generateNpsData(42, 31, "Mar", 48),
  "Last 3 months": generateNpsData(77, 31, "Jan", 52),
  "Last 6 months": generateNpsData(123, 31, "Oct", 45),
  "All time": generateNpsData(999, 31, "Jun", 50),
};

// Gauge chart for Overview
function GaugeChart({ score }: { score: number }) {
  const cx = 72;
  const cy = 72;
  const r = 64;
  const sw = 16;

  // Arc from angle to angle (degrees, 0=left, 180=right, going clockwise over top)
  const arcPath = (startDeg: number, endDeg: number) => {
    const s = Math.PI - (startDeg * Math.PI) / 180;
    const e = Math.PI - (endDeg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(s);
    const y1 = cy - r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy - r * Math.sin(e);
    const large = (endDeg - startDeg) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  // Detractors 1-6 = 6/10 = 108°, Passives 7-8 = 2/10 = 36°, Promoters 9-10 = 2/10 = 36°
  return (
    <div className="flex flex-col items-center relative" style={{ width: 144, height: 108 }}>
      <svg width="144" height="72" viewBox="0 0 144 72">
        <path d={arcPath(0, 108)} fill="none" stroke="#D8D8D8" strokeWidth={sw} />
        <path d={arcPath(108, 144)} fill="none" stroke="#FB813F" strokeWidth={sw} />
        <path d={arcPath(144, 180)} fill="none" stroke="#27A674" strokeWidth={sw} />
      </svg>
      <div className="absolute flex flex-col items-center" style={{ top: 56, left: "50%", transform: "translateX(-50%)" }}>
        <span className="text-xs font-normal leading-3 text-title-secondary">NPS</span>
        <span className="text-[28px] font-semibold text-black leading-8">{score}</span>
      </div>
    </div>
  );
}

// Tooltip for NPS
function NpsTooltip({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
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

// Legend
function Legend() {
  return (
    <div className="flex gap-6 items-center px-2">
      {[
        { label: "Promoters", color: "#27A674" },
        { label: "Passives", color: "#FB813F" },
        { label: "Detractors", color: "#D8D8D8" },
      ].map((c) => (
        <div key={c.label} className="flex gap-2 items-center">
          <div className="w-2 h-2 rounded" style={{ backgroundColor: c.color }} />
          <span className="text-xs font-normal text-text-secondary">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

// Overview view
function OverviewView({ data }: { data: NpsPeriodData }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  return (
    <div className="flex gap-6 items-center w-full">
      <div className="flex flex-1 flex-col h-[176px] justify-between overflow-hidden">
        <div className="flex flex-col" style={{ gap: "2px" }}>
          {data.categories.map((cat, i) => (
            <div
              key={cat.label}
              className={`flex items-center gap-3 pl-2.5 pr-4 rounded-lg transition-colors cursor-pointer h-8 ${
                hoveredIdx === i ? "bg-[rgba(48,46,42,0.04)]" : ""
              }`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="w-2 h-2 rounded shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="flex-1 text-sm font-normal text-text-secondary truncate">{cat.label}</span>
              <span className="text-sm font-normal text-title-secondary">{cat.responses} responces</span>
            </div>
          ))}
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

// Histogram view
function HistogramView({ period, data }: { period: string; data: NpsPeriodData }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mouseY, setMouseY] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const maxVal = Math.max(...data.histogram.map((d) => d.value));

  return (
    <div className="flex flex-col gap-4 w-full relative">
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
              <div className="w-full" style={{ height: 0, borderTop: "1px dashed rgba(0,0,0,0.08)", backgroundImage: "none" }} />
              <div className="w-full" style={{ height: 0, borderTop: "1px dashed rgba(0,0,0,0.08)", backgroundImage: "none" }} />
              <div className="w-full" style={{ height: 0, borderTop: "1px dashed rgba(0,0,0,0.08)", backgroundImage: "none" }} />
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
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: BAR_COLORS[d.type],
                    }}
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
                <NpsTooltip style={{ left, top, pointerEvents: "none" }}>
                  <TooltipRow label="Responces:" value={data.histogram[hoveredIdx].value} />
                  <TooltipRow label="Share" value={`${Math.round((data.histogram[hoveredIdx].value / data.total) * 100)}%`} />
                  <TooltipCaption text={period} />
                </NpsTooltip>
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
      <Legend />
    </div>
  );
}

// Stacked view
function StackedView({ data }: { period: string; data: NpsPeriodData }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mouseY, setMouseY] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const visibleData = data.stacked;
  const labelIndices = [0, 6, 13, 20, 27];

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-4 items-end px-2 w-full">
        <div className="flex gap-2 items-center w-full">
          <div className="flex flex-col h-[120px] justify-between w-8 text-xs font-normal text-text-secondary shrink-0">
            <span>100%</span>
            <span>50%</span>
            <span>0%</span>
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
              <div className="w-full" style={{ height: 0, borderTop: "1px dashed rgba(0,0,0,0.08)", backgroundImage: "none" }} />
              <div className="w-full" style={{ height: 0, borderTop: "1px dashed rgba(0,0,0,0.08)", backgroundImage: "none" }} />
              <div className="w-full" style={{ height: 0, borderTop: "1px dashed rgba(0,0,0,0.08)", backgroundImage: "none" }} />
            </div>
            {visibleData.map((d, i) => (
              <div
                key={i}
                className={`relative z-10 flex flex-1 flex-col h-full justify-end cursor-pointer transition-colors ${
                  hoveredIdx === i ? "bg-[rgba(48,46,42,0.02)]" : ""
                }`}
                onMouseEnter={() => setHoveredIdx(i)}
              >
                <div className="w-2 mx-auto flex flex-col">
                  <div
                    className="w-2 rounded-t-sm"
                    style={{ height: `${(d.promoters / 100) * 120}px`, backgroundColor: "#27A674" }}
                  />
                  <div
                    className="w-2"
                    style={{ height: `${(d.passives / 100) * 120}px`, backgroundColor: "#FB813F" }}
                  />
                  <div
                    className="w-2"
                    style={{ height: `${(d.detractors / 100) * 120}px`, backgroundColor: "#D8D8D8" }}
                  />
                </div>
              </div>
            ))}
            {hoveredIdx !== null && chartRef.current && (() => {
              const cw = chartRef.current!.offsetWidth;
              const ch = chartRef.current!.offsetHeight;
              const count = visibleData.length;
              const barCenterX = ((hoveredIdx + 0.5) / count) * cw;
              const tooltipW = 180;
              const left = Math.max(0, Math.min(barCenterX - tooltipW / 2, cw - tooltipW));
              const top = Math.max(0, Math.min(mouseY + 12, ch - 140));
              return (
                <NpsTooltip style={{ left, top, pointerEvents: "none" }}>
                  <TooltipRow label="NPC" value={visibleData[hoveredIdx].promoters - visibleData[hoveredIdx].detractors} />
                  <TooltipRow label="Responces:" value={visibleData[hoveredIdx].total} />
                  <TooltipRow label="Promoters:" value={visibleData[hoveredIdx].rawPromoters} />
                  <TooltipRow label="Passives:" value={visibleData[hoveredIdx].rawPassives} />
                  <TooltipRow label="Detractors" value={visibleData[hoveredIdx].rawDetractors} />
                  <TooltipCaption text={visibleData[hoveredIdx].label} />
                </NpsTooltip>
              );
            })()}
          </div>
        </div>
        <div className="flex items-center w-full">
          <div className="w-8 shrink-0" />
          <div className="flex flex-1">
            {visibleData.map((d, i) => (
              <div key={i} className="flex-1 text-center text-xs font-normal text-text-secondary whitespace-nowrap">
                {labelIndices.includes(i) ? d.label : ""}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Legend />
    </div>
  );
}

// Trend view
function TrendView({ data }: { period: string; data: NpsPeriodData }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mouseY, setMouseY] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const maxNps = Math.max(...data.trend.map((d) => d.nps));
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
              <div className="w-full" style={{ height: 0, borderTop: "1px dashed rgba(0,0,0,0.08)", backgroundImage: "none" }} />
              <div className="w-full" style={{ height: 0, borderTop: "1px dashed rgba(0,0,0,0.08)", backgroundImage: "none" }} />
              <div className="w-full" style={{ height: 0, borderTop: "1px dashed rgba(0,0,0,0.08)", backgroundImage: "none" }} />
            </div>
            {data.trend.map((d, i) => {
              const heightPct = (d.nps / maxNps) * 100;
              return (
                <div
                  key={i}
                  className={`relative z-10 flex flex-1 h-full items-end justify-center cursor-pointer transition-colors ${
                    hoveredIdx === i ? "bg-[rgba(48,46,42,0.04)]" : ""
                  }`}
                  onMouseEnter={() => setHoveredIdx(i)}
                >
                  <div
                    className="w-2 mx-auto rounded-t-sm bg-brand-accent transition-all duration-300"
                    style={{ height: `${heightPct}%` }}
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
                <NpsTooltip style={{ left, top, pointerEvents: "none" }}>
                  <TooltipRow label="NPS:" value={data.trend[hoveredIdx].nps} />
                  <TooltipRow label="Responces:" value={data.trend[hoveredIdx].responses} />
                  <TooltipCaption text={data.trend[hoveredIdx].label} />
                </NpsTooltip>
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

export default function NpsScore() {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [detailedTab, setDetailedTab] = useState<DetailedTab>("histogram");
  const [period, setPeriod] = useState<DatePeriod>("Last 30 days");

  const data = NPS_DATA[period];
  const periods: DatePeriod[] = ["Last 30 days", "Last 3 months", "Last 6 months", "All time"];
  const viewOptions = ["Overview", "Detailed"] as const;
  type ViewLabel = typeof viewOptions[number];
  const viewLabel: ViewLabel = viewMode === "overview" ? "Overview" : "Detailed";
  const handleViewChange = (v: ViewLabel) => setViewMode(v === "Overview" ? "overview" : "detailed");
  const tabs: { key: DetailedTab; label: string }[] = [
    { key: "histogram", label: "Histogram" },
    { key: "stacked", label: "Stacked" },
    { key: "trend", label: "Trend" },
  ];

  return (
    <div className="bg-white border border-border rounded-xl shadow-[0px_2px_4px_rgba(0,0,0,0.04)] flex flex-col gap-4 overflow-hidden pt-4 px-4 pb-6 w-[764px] relative">
      {/* Header */}
      <div className="flex items-center justify-between pl-2">
        <div className="flex gap-2 items-center">
          <span className="text-sm font-semibold text-title-secondary leading-4">Net Promoter Score</span>
          <QuestionBadge
            title="Net Promoter Score"
            description="A metric that measures customer loyalty by asking how likely they are to recommend on a scale of 0-10."
          />
        </div>
        <div className="flex gap-2 items-center">
          <Dropdown value={viewLabel} options={[...viewOptions]} onChange={handleViewChange} />
          <Dropdown value={period} options={periods} onChange={setPeriod} />
        </div>
      </div>

      {/* Detailed tabs */}
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

      {/* Content */}
      {viewMode === "overview" && <OverviewView data={data} />}
      {viewMode === "detailed" && detailedTab === "histogram" && <HistogramView period={period} data={data} />}
      {viewMode === "detailed" && detailedTab === "stacked" && <StackedView period={period} data={data} />}
      {viewMode === "detailed" && detailedTab === "trend" && <TrendView period={period} data={data} />}
    </div>
  );
}
