import { useEffect, useRef } from "react";
import TopHeader from "./components/TopHeader";
import MultiplyResponse from "./components/MultiplyResponse";
import NpsScore from "./components/NpsScore";
import CsatScore from "./components/CsatScore";

function useOverscrollBounce(maxPull = 60) {
  const contentRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const pulling = useRef(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const apply = (value: number, spring: boolean) => {
      if (spring) {
        el.style.transition = "transform 0.35s cubic-bezier(0.2, 0.8, 0.3, 1)";
      } else {
        el.style.transition = "none";
      }
      el.style.transform = value ? `translateY(${value}px)` : "";
    };

    const onWheel = (e: WheelEvent) => {
      const doc = document.documentElement;
      const atTop = doc.scrollTop <= 0;
      const atBottom = doc.scrollTop + doc.clientHeight >= doc.scrollHeight - 1;

      const pullingDown = e.deltaY < 0 && atTop;
      const pullingUp = e.deltaY > 0 && atBottom;

      if (pullingDown || pullingUp) {
        e.preventDefault();
        pulling.current = true;

        // Rubber-band with high resistance — only noticeable on hard scroll
        const raw = offset.current - e.deltaY * 0.06;
        const sign = raw > 0 ? 1 : -1;
        const abs = Math.min(Math.abs(raw), maxPull * 3);
        offset.current = sign * maxPull * (1 - Math.exp(-abs / maxPull / 2));

        apply(offset.current, false);
      } else if (pulling.current) {
        pulling.current = false;
        offset.current = 0;
        apply(0, true);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [maxPull]);

  return contentRef;
}

function QuestionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center" style={{ gap: "20px" }}>
      <div className="w-[764px]">
        <h2 className="text-lg font-semibold text-title-secondary leading-[22px]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function App() {
  const contentRef = useOverscrollBounce();

  return (
    <div ref={contentRef} className="flex flex-col items-center min-h-screen pt-24 px-8 pb-24" style={{ gap: "56px" }}>
      <TopHeader />
      <QuestionBlock title="Multiply Choice Question">
        <MultiplyResponse />
      </QuestionBlock>
      <QuestionBlock title="Net Promoter Score Question">
        <NpsScore />
      </QuestionBlock>
      <QuestionBlock title="Customer Satisfaction Score Question">
        <CsatScore />
      </QuestionBlock>
    </div>
  );
}

export default App;
