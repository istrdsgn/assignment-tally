import TopHeader from "./components/TopHeader";
import MultiplyResponse from "./components/MultiplyResponse";
import NpsScore from "./components/NpsScore";
import CsatScore from "./components/CsatScore";

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
  return (
    <div className="flex flex-col items-center min-h-screen pt-24 px-8 pb-8" style={{ gap: "56px" }}>
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
