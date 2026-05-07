import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginButton from "../components/LoginButton";

export default function HomePage() {
  const { user, loading } = useAuth();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <div className="intro">
      <div className="intro__crest">
        <svg viewBox="0 0 80 80" width="72" height="72" aria-hidden="true">
          <circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
          <circle cx="40" cy="40" r="21" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.45" />
          <path d="M40 16 L43 35 L62 37 L45 48 L50 67 L40 56 L30 67 L35 48 L18 37 L37 35 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="eyebrow">EDUTECH · 보훈교육 시뮬레이션</div>
      <h1 className="intro__title">별빛 작전</h1>
      <p className="intro__sub">
        달빛과 밤하늘로 설계하는<br />독립운동 비밀 연락 미션
      </p>

      <div className="intro__meta">
        <div><span>대상</span> 중·고등학생 / 예비교사</div>
        <div><span>차시</span> 1–2차시 (45–90분)</div>
        <div><span>구성</span> 8단계 카드형 탐구</div>
      </div>

      {!loading && (
        <div className="intro__actions">
          <Link to="/mission" className="btn btn--primary intro__cta">
            미션 시작하기 ✦
          </Link>
          {user ? (
            <Link to="/records" className="btn btn--ghost intro__cta">
              나의 기록 보기
            </Link>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              {clientId ? (
                <LoginButton />
              ) : null}
              <p style={{ color: "var(--color-text-dim)", fontSize: "var(--text-sm)", margin: 0 }}>
                로그인하면 미션 기록을 저장할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      )}

      <p className="intro__note">
        ※ 본 활동은 실제 천문 데이터와 역사적 맥락을 바탕으로 구성한{" "}
        <strong>교육용 가상 시나리오</strong>입니다.<br />
        인용된 일지·사료는 교육 목적으로 창작된 허구의 자료이며, 특정 인물·사건을 지칭하지 않습니다.
      </p>
    </div>
  );
}
