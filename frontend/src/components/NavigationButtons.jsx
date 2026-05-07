import ProgressBar from "./ProgressBar";

export default function NavigationButtons({
  step,
  total,
  onPrev,
  onNext,
  nextLabel = "다음 →",
  canNext = true,
}) {
  return (
    <div className="navbar">
      <button className="btn btn--ghost" onClick={onPrev} disabled={step === 0}>
        ← 이전
      </button>
      <div className="navbar__progress">
        <div className="navbar__step">
          <span className="navbar__step-num">{String(step + 1).padStart(2, "0")}</span>
          <span className="navbar__step-total"> / {String(total).padStart(2, "0")}</span>
        </div>
        <ProgressBar current={step + 1} total={total} />
      </div>
      <button className="btn btn--primary" onClick={onNext} disabled={!canNext}>
        {nextLabel}
      </button>
    </div>
  );
}
