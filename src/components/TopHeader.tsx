import { useState } from "react";

function LinkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M11.625 9.79167C11.625 12.0929 9.75952 13.9583 7.45833 13.9583H5.79167C3.49048 13.9583 1.625 12.0929 1.625 9.79167C1.625 7.49048 3.49048 5.625 5.79167 5.625H6.20833M8.29167 9.79167C8.29167 7.49048 10.1572 5.625 12.4583 5.625H14.125C16.4262 5.625 18.2917 7.49048 18.2917 9.79167C18.2917 12.0929 16.4262 13.9583 14.125 13.9583H13.7083"
        stroke="#73726C"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M7.87488 2.87338L9.2891 4.2876M1.625 10.6233L1.64873 10.4572C1.73269 9.8695 1.77467 9.57565 1.87015 9.30132C1.95488 9.05788 2.07063 8.82639 2.21454 8.61254C2.37671 8.37155 2.5866 8.16167 3.00638 7.74189L8.83037 1.91789C9.2209 1.52737 9.85407 1.52737 10.2446 1.91789C10.6351 2.30842 10.6351 2.94158 10.2446 3.33211L4.31373 9.26297C3.9329 9.64379 3.74249 9.8342 3.52561 9.98563C3.3331 10.12 3.12547 10.2314 2.907 10.3174C2.66086 10.4143 2.39688 10.4675 1.86897 10.574L1.625 10.6233Z"
        stroke="white"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const TABS = ["Summary", "Submissions", "Share", "Integrations", "Insights", "Settings"];

export default function TopHeader() {
  const [activeTab, setActiveTab] = useState("Summary");

  return (
    <div className="flex flex-col gap-6 w-[764px]">
      {/* Top info */}
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-semibold text-title-primary leading-8">Template</h1>
        <div className="flex gap-2 items-center">
          <button className="flex items-center p-1 hover:bg-black/4 rounded transition-colors">
            <LinkIcon />
          </button>
          <div className="bg-[#e0e0e0] rounded-full w-7 h-7" />
          <button className="bg-brand-accent flex gap-1 items-center justify-center pl-2 pr-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
            <PenIcon />
            <span className="text-sm font-normal text-white leading-4">Edit</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 items-center border-b border-[#edebeb]">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-sm font-semibold leading-4 transition-colors ${
              activeTab === tab
                ? "text-title-primary border-b-2 border-black"
                : "text-text-secondary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
