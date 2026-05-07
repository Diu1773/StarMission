import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { recordsApi } from "../api/records";
import { MOON_LABELS, TIME_LABELS, ROUTE_LABELS } from "../data/options";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const LEVEL_COLOR = {
  높음: "var(--color-risk-high)",
  중간: "var(--color-risk-mid)",
  낮음: "var(--color-risk-low)",
  우수: "var(--color-risk-low)",
  보통: "var(--color-risk-mid)",
  미흡: "var(--color-risk-high)",
};

function Badge({ label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 700, color: LEVEL_COLOR[value] || "var(--color-star-300)" }}>{value}</span>
    </div>
  );
}

export default function RecordDetailPage() {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    recordsApi
      .get(id)
      .then(setRecord)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}><div className="eyebrow">불러오는 중…</div></div>;
  if (error) return (
    <div className="screen">
      <div className="error-banner">{error}</div>
      <Link to="/records" className="btn btn--ghost" style={{ marginTop: 16 }}>← 목록으로</Link>
    </div>
  );
  if (!record) return null;

  return (
    <div className="screen">
      <header className="screen__head">
        <div className="eyebrow">기록 상세</div>
        <h1 className="screen__title">별빛 작전 — 기록 #{ record.id}</h1>
        <p className="screen__subtitle">{formatDate(record.created_at)}</p>
      </header>

      <div className="screen__body">
        {/* 선택 요약 */}
        <div className="card">
          <div className="eyebrow" style={{ marginBottom: 16 }}>선택 조건</div>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-dim)", marginBottom: 4 }}>달의 위상</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700 }}>
                {MOON_LABELS[record.selected_moon] || record.selected_moon}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-dim)", marginBottom: 4 }}>이동 시간</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700 }}>
                {TIME_LABELS[record.selected_time] || record.selected_time}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-dim)", marginBottom: 4 }}>이동 경로</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700 }}>
                {ROUTE_LABELS[record.selected_route] || record.selected_route}
              </div>
            </div>
          </div>
        </div>

        {/* 점수 */}
        <div className="card">
          <div className="eyebrow" style={{ marginBottom: 16 }}>작전 분석 결과</div>
          <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
            <Badge label="노출 위험도" value={record.exposure_risk} />
            <Badge label="이동 가능성" value={record.mobility} />
            <Badge label="방향 판단" value={record.navigation} />
            <Badge label="종합 적절성" value={record.overall} />
          </div>
        </div>

        {/* AI 피드백 */}
        <div className="card">
          <div className="eyebrow" style={{ marginBottom: 12 }}>AI 피드백</div>
          <div className="feedback-box">{record.feedback_text}</div>
        </div>

        {/* 선택 근거 */}
        <div className="reflection">
          <div className="eyebrow">선택 근거</div>
          <p style={{ margin: 0, lineHeight: "var(--leading-loose)" }}>{record.reason_text}</p>
          <div className="divider" />
          <div className="eyebrow">보훈 성찰</div>
          <div className="reflection__quote">{record.reflection_text}</div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/records" className="btn btn--ghost">← 목록으로</Link>
          <Link to="/mission" className="btn btn--primary">새 미션 시작</Link>
        </div>
      </div>
    </div>
  );
}
