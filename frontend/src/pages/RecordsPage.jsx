import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { recordsApi } from "../api/records";
import { MOON_LABELS, TIME_LABELS, ROUTE_LABELS } from "../data/options";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

const OVERALL_COLOR = { 우수: "var(--color-risk-low)", 보통: "var(--color-risk-mid)", 미흡: "var(--color-risk-high)" };

export default function RecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    recordsApi
      .list()
      .then(setRecords)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="screen">
      <header className="screen__head">
        <div className="eyebrow">나의 기록</div>
        <h1 className="screen__title">별빛 작전 — 기록 목록</h1>
        <p className="screen__subtitle">저장된 미션 기록을 확인하고 상세 내용을 볼 수 있습니다.</p>
      </header>

      <div className="screen__body">
        {loading && (
          <div className="empty-state">
            <div className="eyebrow">불러오는 중…</div>
          </div>
        )}

        {error && (
          <div className="error-banner">기록을 불러오지 못했습니다: {error}</div>
        )}

        {!loading && !error && records.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">✦</div>
            <div className="empty-state__title">저장된 기록이 없습니다</div>
            <p className="empty-state__desc">미션을 완료하고 기록을 저장해보세요.</p>
            <Link to="/mission" className="btn btn--primary">미션 시작하기</Link>
          </div>
        )}

        {!loading && records.length > 0 && (
          <div className="stack">
            {records.map((r) => (
              <Link key={r.id} to={`/records/${r.id}`} className="record-card">
                <div className="record-card__date">{formatDate(r.created_at)}</div>
                <div className="record-card__meta">
                  <span className="tag">{MOON_LABELS[r.selected_moon] || r.selected_moon}</span>
                  <span className="tag">{TIME_LABELS[r.selected_time] || r.selected_time}</span>
                  <span className="tag">{ROUTE_LABELS[r.selected_route] || r.selected_route}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>종합 적절성</span>
                  <span className="record-card__overall" style={{ color: OVERALL_COLOR[r.overall] || "var(--color-star-300)" }}>
                    {r.overall}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <Link to="/mission" className="btn btn--primary">새 미션 시작</Link>
          <Link to="/" className="btn btn--ghost">홈으로</Link>
        </div>
      </div>
    </div>
  );
}
