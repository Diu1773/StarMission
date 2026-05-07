import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import CardFrame from "../components/CardFrame";
import NavigationButtons from "../components/NavigationButtons";
import StarMissionSkyMap from "../components/StarMissionSkyMap";
import { MOON_OPTIONS, TIME_OPTIONS, ROUTE_OPTIONS, MOON_LABELS, TIME_LABELS, ROUTE_LABELS } from "../data/options";
import { CARDS } from "../data/cards";

const LS_KEY = "starmission_draft";
const TOTAL_STEPS = CARDS.length;

const INITIAL_STATE = {
  selectedMoon: null,
  selectedTime: null,
  selectedRoute: null,
  reasonText: "",
  reflectionText: "",
};

function loadDraft() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_STATE;
  } catch (_) {
    return INITIAL_STATE;
  }
}

/* ── SVG 컴포넌트 (Artifacts에서 포팅) ── */
function MoonIcon({ variant }) {
  if (variant === "full") return (
    <svg viewBox="0 0 80 80" width="72" height="72">
      <defs>
        <radialGradient id="mg-full" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#fff8e8" />
          <stop offset="70%" stopColor="#f5e6a8" />
          <stop offset="100%" stopColor="#d4b15a" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="28" fill="url(#mg-full)" />
      <circle cx="32" cy="34" r="3" fill="#c9a040" opacity="0.25" />
      <circle cx="50" cy="46" r="4.5" fill="#c9a040" opacity="0.18" />
      <circle cx="44" cy="27" r="2.2" fill="#c9a040" opacity="0.22" />
    </svg>
  );
  if (variant === "half") return (
    <svg viewBox="0 0 80 80" width="72" height="72">
      <defs>
        <radialGradient id="mg-half" cx="70%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff8e8" />
          <stop offset="100%" stopColor="#d4b15a" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="28" fill="#0e1a35" />
      <path d="M40 12 A28 28 0 0 1 40 68 Z" fill="url(#mg-half)" />
      <circle cx="40" cy="40" r="28" fill="none" stroke="#2a3a60" strokeWidth="0.8" />
    </svg>
  );
  return (
    <svg viewBox="0 0 80 80" width="72" height="72">
      <defs>
        <radialGradient id="mg-new" cx="30%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#e8d070" />
          <stop offset="100%" stopColor="#b89040" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="28" fill="#0e1a35" />
      <path d="M50 14 A28 28 0 1 0 50 66 A22 22 0 1 1 50 14 Z" fill="url(#mg-new)" opacity="0.9" />
      <circle cx="40" cy="40" r="28" fill="none" stroke="#2a3a60" strokeWidth="0.8" />
    </svg>
  );
}

const STAR_CATALOG = [
  { x: 200, y: 72,  r: 3.8, color: "#fff8e0", glow: true  }, // Polaris
  { x: 148, y: 148, r: 2.8, color: "#ffe8b8" },              // α UMa 두베
  { x: 168, y: 168, r: 2.4, color: "#ffe0a0" },              // β UMa 메라크
  { x: 210, y: 178, r: 2.2, color: "#fff0c8" },              // γ UMa 페크다
  { x: 240, y: 162, r: 2.0, color: "#fff0c8" },              // δ UMa 메그레즈
  { x: 268, y: 145, r: 2.8, color: "#d8e8ff" },              // ε UMa 알리오트
  { x: 286, y: 125, r: 2.5, color: "#d8e8ff" },              // ζ UMa 미자르
  { x: 295, y: 100, r: 2.6, color: "#c8d8ff" },              // η UMa 알카이드
  { x: 174, y: 100, r: 2.2, color: "#ffc880" },              // β UMi 코카브
  { x: 192, y: 118, r: 1.8, color: "#ffd898" },              // γ UMi 페르카드
  { x: 310, y: 175, r: 2.2, color: "#fff0c8" },              // α Cas 세게인
  { x: 324, y: 155, r: 1.8, color: "#e8f4ff" },              // β Cas 카프
  { x: 340, y: 168, r: 2.5, color: "#d0e8ff" },              // γ Cas 나비
  { x: 358, y: 155, r: 1.8, color: "#f0f4ff" },              // δ Cas 루크바
  { x: 374, y: 168, r: 1.6, color: "#c8d8ff" },              // ε Cas 세긴
  { x: 330, y: 108, r: 2.0, color: "#f8f0e0" },              // α Cep 알데라민
  { x: 292, y: 190, r: 2.0, color: "#ffd880" },              // γ Dra 에타닌
];

const BG_STARS = Array.from({ length: 120 }, (_, i) => ({
  x: ((i * 137 + 53) * 7 + 11) % 400,
  y: ((i * 89 + 31) * 5 + 17) % 220,
  r: [0.5, 0.5, 0.6, 0.8, 0.5, 0.5, 0.7, 0.5, 0.9, 0.5][i % 10],
  op: 0.35 + (i % 6) * 0.1,
}));

function SkyChart() {
  return (
    <svg viewBox="0 0 400 280" width="100%" height="auto" aria-label="북쪽 밤하늘 별자리 도식">
      <defs>
        <radialGradient id="sky-grad" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#0e1a3a" />
          <stop offset="100%" stopColor="#030608" />
        </radialGradient>
        <filter id="star-glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="faint-glow">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* 배경 */}
      <rect width="400" height="280" fill="url(#sky-grad)" />
      <path d="M 0 220 Q 60 180 100 140 T 180 100 T 250 80 T 320 60 T 400 40" stroke="rgba(200,220,255,0.06)" strokeWidth="28" fill="none" />

      {/* 배경 별 */}
      {BG_STARS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.op} />)}

      {/* 산 실루엣 */}
      <path d="M0 260 L55 225 L110 248 L165 210 L220 235 L275 200 L330 222 L385 208 L400 215 L400 280 L0 280 Z" fill="#090e1e" />
      <path d="M0 265 L30 252 L80 258 L130 250 L180 254 L230 248 L280 252 L340 246 L400 250 L400 280 L0 280 Z" fill="#060a18" />

      {/* 자오선 */}
      <line x1="200" y1="0" x2="200" y2="200" stroke="rgba(232,207,122,0.07)" strokeWidth="1" strokeDasharray="4 6" />

      {/* 카시오페이아 연결선 */}
      <polyline points="310,175 324,155 340,168 358,155 374,168" stroke="rgba(200,220,255,0.45)" strokeWidth="0.7" fill="none" />

      {/* 북두칠성 연결선 */}
      <polyline points="148,148 168,168 210,178 240,162 268,145 286,125 295,100" stroke="rgba(232,207,122,0.5)" strokeWidth="0.8" fill="none" />

      {/* 작은곰자리 (북극성 → β → γ) */}
      <polyline points="200,72 174,100 192,118" stroke="rgba(255,200,100,0.35)" strokeWidth="0.6" fill="none" strokeDasharray="3 3" />

      {/* 북두칠성 → 북극성 가이드 화살표 */}
      <line x1="148" y1="148" x2="204" y2="76" stroke="rgba(232,207,122,0.55)" strokeWidth="0.5" strokeDasharray="5 4" />
      <polygon points="200,68 206,82 194,82" fill="rgba(232,207,122,0.6)" />

      {/* 주요 별 렌더링 */}
      {STAR_CATALOG.map((s, i) => (
        <g key={i} filter={s.glow ? "url(#star-glow)" : s.r >= 2.2 ? "url(#faint-glow)" : undefined}>
          <circle cx={s.x} cy={s.y} r={s.r} fill={s.color || "#fff"} />
        </g>
      ))}

      {/* 북극성 강조 링 */}
      <circle cx="200" cy="72" r="10" fill="none" stroke="#e8cf7a" strokeWidth="0.7" opacity="0.6" />
      <circle cx="200" cy="72" r="16" fill="none" stroke="#e8cf7a" strokeWidth="0.3" opacity="0.35" />

      {/* 별자리 라벨 */}
      <text x="202" y="58" fill="#f5e6a8" fontSize="9.5" fontFamily="serif" textAnchor="middle" fontWeight="bold">북극성</text>
      <text x="202" y="49" fill="#c8b878" fontSize="7.5" fontFamily="monospace" textAnchor="middle">Polaris</text>
      <text x="215" y="192" fill="rgba(232,207,122,0.7)" fontSize="8" fontFamily="serif">북두칠성</text>
      <text x="215" y="202" fill="rgba(200,180,100,0.55)" fontSize="6.5" fontFamily="monospace">Ursa Major</text>
      <text x="330" y="145" fill="rgba(200,220,255,0.7)" fontSize="8" fontFamily="serif">카시오페이아</text>
      <text x="330" y="155" fill="rgba(160,190,220,0.5)" fontSize="6.5" fontFamily="monospace">Cassiopeia</text>

      {/* 나침반 */}
      <g transform="translate(36, 248)">
        <circle r="18" fill="rgba(6,9,20,0.8)" stroke="rgba(232,207,122,0.4)" strokeWidth="0.8" />
        <text y="-22" textAnchor="middle" fill="#e8cf7a" fontSize="11" fontFamily="serif" fontWeight="bold">N</text>
        <text y="28" textAnchor="middle" fill="#4a5a80" fontSize="8">S</text>
        <text x="22" y="3" textAnchor="middle" fill="#4a5a80" fontSize="8">E</text>
        <text x="-22" y="3" textAnchor="middle" fill="#4a5a80" fontSize="8">W</text>
        <line x1="0" y1="4" x2="0" y2="-14" stroke="#e8cf7a" strokeWidth="1.5" />
        <circle cx="0" cy="-14" r="2" fill="#e8cf7a" />
      </g>

      <text x="390" y="14" fill="rgba(200,180,100,0.6)" fontSize="7" fontFamily="monospace" textAnchor="end">북위 37° · 밤 22:00</text>
    </svg>
  );
}

function RouteMapSVG({ selected }) {
  return (
    <svg viewBox="0 0 680 240" width="100%" height="auto" aria-label="이동 경로 지도">
      <defs>
        <linearGradient id="river-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1a3060" />
          <stop offset="50%" stopColor="#213875" />
          <stop offset="100%" stopColor="#1a3060" />
        </linearGradient>
      </defs>
      <rect width="680" height="240" fill="#0d1828" />
      <path d="M0 182 Q120 162 240 178 Q360 194 480 172 Q580 156 680 165" stroke="url(#river-grad)" strokeWidth="22" fill="none" opacity="0.85" />
      <path d="M100 115 L145 72 L200 105 L255 58 L315 108 L370 75 L425 112 L480 88 L530 115 L540 135 L90 135 Z" fill="#1e2d4a" />
      {[60, 110, 160, 500, 550, 600].map((x, i) => <ellipse key={i} cx={x} cy="162" rx="12" ry="8" fill="rgba(20,60,30,0.6)" />)}
      <g transform="translate(62,155)">
        <rect x="-18" y="-14" width="36" height="28" rx="3" fill="#1a2952" />
        <polygon points="-18,-14 0,-24 18,-14" fill="#1e3266" />
      </g>
      <g transform="translate(618,156)">
        <rect x="-18" y="-14" width="36" height="28" rx="3" fill="#1a2952" />
        <polygon points="-18,-14 0,-24 18,-14" fill="#1e3266" />
      </g>
      <g transform="translate(340,155)">
        <rect x="-12" y="-8" width="24" height="16" rx="2" fill="#5a1a1a" />
        <line x1="-12" y1="0" x2="12" y2="0" stroke="#c97064" strokeWidth="1.5" />
        <text x="0" y="28" textAnchor="middle" fill="#c97064" fontSize="8" fontFamily="serif">검문소</text>
      </g>
      {/* C 경로: 하천 주변 */}
      <path d="M62 162 Q160 195 280 184 Q400 174 540 162 T 618 162" stroke="#9ec6e8" strokeWidth={selected === "routeC" ? 3 : 2} fill="none" strokeDasharray="7 5" opacity={selected === "routeC" ? 1 : 0.45} />
      <text x="270" y="212" fill="#9ec6e8" fontSize="11" fontFamily="serif" opacity={selected === "routeC" ? 1 : 0.55}>C · 하천 주변</text>
      {/* B 경로: 산지·숲 */}
      <path d="M62 155 Q100 110 160 95 Q240 78 340 82 Q430 86 530 100 T 618 155" stroke="#6fb98f" strokeWidth={selected === "routeB" ? 3 : 2} fill="none" strokeDasharray="7 5" opacity={selected === "routeB" ? 1 : 0.45} />
      <text x="310" y="68" fill="#6fb98f" fontSize="11" fontFamily="serif" opacity={selected === "routeB" ? 1 : 0.55}>B · 산지·숲 우회</text>
      {/* A 경로: 마을·도로 */}
      <path d="M62 155 L618 155" stroke="#c97064" strokeWidth={selected === "routeA" ? 3 : 2} fill="none" strokeDasharray="7 5" opacity={selected === "routeA" ? 1 : 0.45} />
      <text x="310" y="147" fill="#c97064" fontSize="11" fontFamily="serif" opacity={selected === "routeA" ? 1 : 0.55}>A · 마을·도로 통과</text>
      <circle cx="62" cy="155" r="7" fill="#e8cf7a" />
      <circle cx="618" cy="155" r="7" fill="#e8cf7a" />
      <text x="62" y="228" textAnchor="middle" fill="#e8cf7a" fontSize="11" fontFamily="serif">출발</text>
      <text x="618" y="228" textAnchor="middle" fill="#e8cf7a" fontSize="11" fontFamily="serif">도착</text>
      <text x="10" y="14" fill="rgba(200,180,100,0.6)" fontSize="7.5" fontFamily="monospace">가상의 작전 지형도 — 교육용 창작</text>
    </svg>
  );
}

function ImgWithFallback({ src, alt, fallbackLabel, fallbackHint, style }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div className="img-fallback" style={style}>
        <div className="img-fallback__icon">□</div>
        <div className="img-fallback__label">{fallbackLabel}</div>
        {fallbackHint && <div className="img-fallback__hint">{fallbackHint}</div>}
      </div>
    );
  }
  return (
    <img
      src={src} alt={alt}
      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit", ...style }}
      onError={() => setErr(true)}
    />
  );
}

function Metric({ label, level, invert }) {
  const raw = level === "high" ? 3 : level === "mid" ? 2 : 1;
  const goodScore = invert ? raw : 4 - raw;
  const colorVar = goodScore >= 3 ? "var(--color-risk-low)" : goodScore === 2 ? "var(--color-risk-mid)" : "var(--color-risk-high)";
  return (
    <div className="metric">
      <div className="metric__label">{label}</div>
      <div className="metric__bars">
        {[1, 2, 3].map(i => <span key={i} style={{ background: i <= raw ? colorVar : "var(--color-night-500)" }} />)}
      </div>
      <div className="metric__value" style={{ color: colorVar }}>
        {level === "high" ? "높음" : level === "mid" ? "보통" : "낮음"}
      </div>
    </div>
  );
}

/* ── 카드별 렌더링 ── */
function InfoCard({ card, navProps }) {
  return (
    <CardFrame eyebrow={card.eyebrow} title={card.title} subtitle={card.body} footer={<NavigationButtons {...navProps} />}>
      <div className="grid grid-2">
        <div className="img-frame" style={{ minHeight: 240 }}>
          <ImgWithFallback src={card.image} alt={card.imageAlt} fallbackLabel={card.imageFallbackLabel} fallbackHint={card.imageFallbackHint} style={{ minHeight: 240 }} />
        </div>
        <div style={{ alignSelf: "flex-start", marginTop: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="hint">
            <div className="question__label" style={{ marginBottom: 8 }}>탐구 질문</div>
            <p style={{ margin: 0, fontSize: "var(--text-base)", lineHeight: "var(--leading-loose)" }}>{card.question}</p>
          </div>
          {card.historicalNote && (
            <div className="historical-note">
              <div className="historical-note__label">📜 실제 역사 기록</div>
              <p style={{ margin: 0, lineHeight: "var(--leading-loose)" }}>{card.historicalNote}</p>
            </div>
          )}
        </div>
      </div>
    </CardFrame>
  );
}

function MoonCard({ state, setState, card, navProps }) {
  const previewPhase = state.selectedMoon || "full";
  return (
    <CardFrame eyebrow={card.eyebrow} title={card.title} subtitle={card.body}
      footer={<NavigationButtons {...navProps} canNext={!!state.selectedMoon} />}>
      <div className="grid grid-3">
        {MOON_OPTIONS.map(p => (
          <button key={p.id} className={"phase-card" + (state.selectedMoon === p.id ? " is-selected" : "")}
            onClick={() => setState(s => ({ ...s, selectedMoon: p.id }))}>
            <div className="phase-card__moon"><MoonIcon variant={p.icon} /></div>
            <div className="phase-card__name">{p.label}</div>
            <span className={`tag tag--risk-${p.risk}`}>
              노출 위험 {p.risk === "high" ? "높음 ▲" : p.risk === "mid" ? "보통 ●" : "낮음 ▼"}
            </span>
            <div className="phase-card__list">
              <div className="phase-card__list-title">유리한 점</div>
              <ul>{p.pros.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
            <div className="phase-card__list">
              <div className="phase-card__list-title">위험 요소</div>
              <ul>{p.cons.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          밤하늘 시뮬레이션 — {state.selectedMoon ? `선택한 위상: ${MOON_LABELS[state.selectedMoon]}` : "위상을 선택하면 하늘 밝기가 바뀝니다"}
        </div>
        <StarMissionSkyMap
          selectedTime="moonHigh"
          moonPhase={previewPhase === "full" ? "full" : previewPhase === "half" ? "half" : "new"}
          interactive={false}
          height={320}
        />
      </div>
    </CardFrame>
  );
}

function TimeCard({ state, setState, card, navProps }) {
  const events = [
    { t: 0, label: "일몰", sub: "19:25" },
    { t: 22, label: "박명 종료", sub: "20:30" },
    { t: 50, label: "월출", sub: "21:50" },
    { t: 88, label: "월몰", sub: "03:30" },
  ];
  return (
    <CardFrame eyebrow={card.eyebrow} title={card.title} subtitle={card.body}
      footer={<NavigationButtons {...navProps} canNext={!!state.selectedTime} />}>
      <div className="timeline">
        <div className="timeline__legend">
          <span><i style={{ background: "linear-gradient(90deg,#7055a0,#3a4d8a)" }} /> 박명</span>
          <span><i style={{ background: "rgba(232,207,122,0.55)" }} /> 달이 뜬 시간</span>
          <span><i style={{ background: "#0a0d1a", border: "1px solid rgba(232,207,122,0.3)" }} /> 깊은 어둠</span>
        </div>
        <div className="timeline__bar">
          <div className="timeline__band timeline__band--dusk" style={{ left: "0%", width: "22%" }} />
          <div className="timeline__band timeline__band--dark" style={{ left: "22%", width: "28%" }} />
          <div className="timeline__band timeline__band--moon" style={{ left: "50%", width: "38%" }} />
          <div className="timeline__band timeline__band--dark" style={{ left: "88%", width: "12%" }} />
          {events.map((e, i) => (
            <div key={i} className="timeline__event" style={{ left: `${e.t}%` }}>
              <div className="timeline__tick" />
              <div className="timeline__event-label"><strong>{e.label}</strong><span>{e.sub}</span></div>
            </div>
          ))}
        </div>
        <div className="timeline__hours">
          <span>19:00</span><span>21:00</span><span>23:00</span><span>01:00</span><span>03:00</span><span>05:00</span>
        </div>
      </div>
      <div className="grid grid-4">
        {TIME_OPTIONS.map(s => (
          <button key={s.id} className={"slot-card" + (state.selectedTime === s.id ? " is-selected" : "")}
            onClick={() => setState(st => ({ ...st, selectedTime: s.id }))}>
            <span className={`tag tag--risk-${s.risk}`}>
              위험 {s.risk === "high" ? "높음 ▲" : s.risk === "mid" ? "보통 ●" : "낮음 ▼"}
            </span>
            <div className="slot-card__time">{s.time}</div>
            <div className="slot-card__label">{s.label}</div>
            <p className="slot-card__desc">{s.desc}</p>
          </button>
        ))}
      </div>
    </CardFrame>
  );
}

function PolarisCard({ state, card, navProps }) {
  return (
    <CardFrame eyebrow={card.eyebrow} title={card.title} subtitle={card.body}
      footer={<NavigationButtons {...navProps} />}>
      <StarMissionSkyMap selectedTime={state.selectedTime} />
      <div className="hint" style={{ marginTop: 12 }}>{card.question}</div>
    </CardFrame>
  );
}

function RouteCard({ state, setState, card, navProps }) {
  return (
    <CardFrame eyebrow={card.eyebrow} title={card.title} subtitle={card.body}
      footer={<NavigationButtons {...navProps} canNext={!!state.selectedRoute} />}>
      <div className="route-map"><RouteMapSVG selected={state.selectedRoute} /></div>
      <div className="grid grid-3" style={{ marginTop: 20 }}>
        {ROUTE_OPTIONS.map(r => (
          <button key={r.id} className={"route-card" + (state.selectedRoute === r.id ? " is-selected" : "")}
            onClick={() => setState(s => ({ ...s, selectedRoute: r.id }))}>
            <div className="route-card__head">
              <div className="route-card__id">{r.label}</div>
              <div className="route-card__name">{r.name}</div>
            </div>
            <div className="route-card__meta">
              <span><b>{r.length}</b> 거리</span>
              <span><b>{r.time}</b> 소요</span>
            </div>
            <p className="route-card__desc">{r.desc}</p>
            <div className="route-card__metrics">
              <Metric label="노출 위험" level={r.exposure} invert={false} />
              <Metric label="이동 난이도" level={r.difficulty} invert={false} />
              <Metric label="은신 가능성" level={r.hide} invert={true} />
            </div>
          </button>
        ))}
      </div>
    </CardFrame>
  );
}

function PlanCard({ state, setState, card, navProps, opNo }) {
  const canNext = !!state.reasonText && state.reasonText.length >= 20
    && !!state.reflectionText && state.reflectionText.length >= 10;
  return (
    <CardFrame eyebrow={card.eyebrow} title={card.title} subtitle={card.body}
      footer={<NavigationButtons {...navProps} nextLabel="결과 확인 →" canNext={canNext} />}>
      <div className="grid grid-2">
        <div className="plan-sheet">
          <div className="plan-sheet__head">
            <div className="plan-sheet__title">작전 계획서</div>
            <div className="plan-sheet__seal">機密</div>
          </div>
          <dl className="plan-sheet__list">
            <div><dt>작전명</dt><dd>별빛 작전 / 第 {opNo}호</dd></div>
            <div><dt>달의 위상</dt><dd>{MOON_LABELS[state.selectedMoon] || "—"}</dd></div>
            <div><dt>이동 시간</dt><dd>{TIME_LABELS[state.selectedTime] || "—"}</dd></div>
            <div><dt>이동 경로</dt><dd>{ROUTE_LABELS[state.selectedRoute] || "—"}</dd></div>
          </dl>
          <div className="plan-sheet__notice">
            ※ 교육용 가상 작전 계획서입니다. 실존 인물·사건과 무관합니다.
          </div>
        </div>
        <div className="stack">
          <div>
            <div className="question__label">선택 근거 서술</div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", marginTop: 8, marginBottom: 8 }}>왜 이 조합이 가장 적절한가요?</h3>
            <p className="muted" style={{ fontSize: "var(--text-sm)", marginBottom: 8 }}>달빛·시간대·경로의 관계를 연결해 작성해주세요. (최소 20자)</p>
            <textarea className="textarea" rows={6}
              placeholder="예) 그믐달을 골라 달빛 노출을 줄이고, 월출 전의 가장 어두운 시간대에 산지·숲 우회로로 이동한다. 달빛이 없어도 북극성으로 방향을 잡을 수 있어…"
              value={state.reasonText}
              onChange={e => setState(s => ({ ...s, reasonText: e.target.value }))} />
            <div className="textarea__counter">
              <span style={{ color: state.reasonText.length >= 20 ? "var(--color-risk-low)" : "var(--color-text-dim)" }}>
                {state.reasonText.length}자
              </span>{" "}/ 최소 20자
            </div>
          </div>
          <div>
            <div className="question__label">보훈 성찰문</div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", marginTop: 8, marginBottom: 8 }}>이 활동을 통해 무엇을 느꼈나요?</h3>
            <p className="muted" style={{ fontSize: "var(--text-sm)", marginBottom: 8 }}>독립운동가들의 선택과 그 의미에 대해 자유롭게 적어주세요. (최소 10자)</p>
            <textarea className="textarea" rows={5}
              placeholder="예) 이 활동을 통해 독립운동가들이 얼마나 치밀하게 환경을 관찰하고 행동했는지를 느꼈습니다…"
              value={state.reflectionText}
              onChange={e => setState(s => ({ ...s, reflectionText: e.target.value }))} />
            <div className="textarea__counter">
              <span style={{ color: state.reflectionText.length >= 10 ? "var(--color-risk-low)" : "var(--color-text-dim)" }}>
                {state.reflectionText.length}자
              </span>{" "}/ 최소 10자
            </div>
          </div>
        </div>
      </div>
    </CardFrame>
  );
}

export default function MissionPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [state, setState] = useState(loadDraft);
  const [opNo] = useState(() => String(Math.floor(Math.random() * 99) + 1).padStart(3, "0"));

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  const card = CARDS[step];

  const navProps = {
    step,
    total: TOTAL_STEPS,
    onPrev: () => setStep(s => Math.max(0, s - 1)),
    onNext: () => {
      if (step < TOTAL_STEPS - 1) {
        setStep(s => s + 1);
      } else {
        localStorage.setItem(
          "starmission_result",
          JSON.stringify({ ...state, opNo })
        );
        navigate("/result");
      }
    },
  };

  const renderCard = () => {
    switch (card.type) {
      case "moon":     return <MoonCard    state={state} setState={setState} card={card} navProps={navProps} />;
      case "timeline": return <TimeCard    state={state} setState={setState} card={card} navProps={navProps} />;
      case "polaris":  return <PolarisCard state={state} card={card} navProps={navProps} />;
      case "route":    return <RouteCard   state={state} setState={setState} card={card} navProps={navProps} />;
      case "plan":     return <PlanCard    state={state} setState={setState} card={card} navProps={navProps} opNo={opNo} />;
      default:         return <InfoCard    card={card} navProps={navProps} />;
    }
  };

  return (
    <>
      <div className="app__brand">별빛 작전 · 보훈교육 시뮬레이션</div>
      {renderCard()}
    </>
  );
}
