/* global React */
const { useState, useMemo } = React;

/* ============================================================
   공용 컴포넌트
   ============================================================ */

function ScreenShell({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="screen">
      <header className="screen__head">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="screen__title">{title}</h1>
        {subtitle && <p className="screen__subtitle">{subtitle}</p>}
      </header>
      <div className="screen__body">{children}</div>
      {footer && <footer className="screen__foot">{footer}</footer>}
    </div>
  );
}

function NavBar({ step, total, onPrev, onNext, nextLabel = "다음", canNext = true }) {
  return (
    <div className="navbar">
      <button className="btn btn--ghost" onClick={onPrev} disabled={step === 0}>← 이전</button>
      <div className="navbar__progress">
        <div className="navbar__step">
          <span className="navbar__step-num">{String(step + 1).padStart(2, "0")}</span>
          <span className="navbar__step-total"> / {String(total).padStart(2, "0")}</span>
        </div>
        <div className="progress" style={{ width: 200 }}>
          <div className="progress__fill" style={{ width: `${((step + 1) / total) * 100}%` }} />
        </div>
      </div>
      <button className="btn btn--primary" onClick={onNext} disabled={!canNext}>
        {nextLabel} →
      </button>
    </div>
  );
}

/* ── 이미지 슬롯: public/assets에 실제 이미지가 없으면 fallback ── */
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
  return <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit", ...style }} onError={() => setErr(true)} />;
}

/* ============================================================
   1. 인트로
   ============================================================ */
function IntroScreen({ onStart }) {
  return (
    <div className="intro" data-screen-label="01 인트로">
      <div className="intro__crest">
        <svg viewBox="0 0 80 80" width="72" height="72" aria-hidden="true">
          <circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35"/>
          <circle cx="40" cy="40" r="21" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.45"/>
          <path d="M40 16 L43 35 L62 37 L45 48 L50 67 L40 56 L30 67 L35 48 L18 37 L37 35 Z" fill="currentColor"/>
        </svg>
      </div>
      <div className="eyebrow">EDUTECH · 보훈교육 시뮬레이션</div>
      <h1 className="intro__title">별빛 작전</h1>
      <p className="intro__sub">달빛과 밤하늘로 설계하는<br />독립운동 비밀 연락 미션</p>
      <div className="intro__meta">
        <div><span>대상</span> 중·고등학생 / 예비교사</div>
        <div><span>차시</span> 1–2차시 (45–90분)</div>
        <div><span>구성</span> 7단계 카드형 탐구</div>
      </div>
      <button className="btn btn--primary intro__cta" onClick={onStart}>미션 시작하기 ✦</button>
      <p className="intro__note">
        ※ 본 활동은 실제 천문 데이터와 역사적 맥락을 바탕으로 구성한 <strong>교육용 가상 시나리오</strong>입니다.<br />
        인용된 일지·사료는 교육 목적으로 창작된 허구의 자료이며, 특정 인물·사건을 지칭하지 않습니다.
      </p>
    </div>
  );
}

/* ============================================================
   2. 역사 자료 / 가상 시나리오 분리 카드
   ============================================================ */
function HistoryCardScreen({ state, setState, ...nav }) {
  const observations = [
    { id: "moon",  text: "연락원은 달빛이 약한 날을 골라 이동했다." },
    { id: "path",  text: "산길과 강변을 따라 마을을 우회하는 경로를 택했다." },
    { id: "time",  text: "일몰 직후의 박명 시간은 피해야 한다고 기록되어 있다." },
    { id: "star",  text: "북극성을 기준 삼아 방향을 잡았다는 구술이 남아 있다." },
  ];
  const toggle = (id) => {
    const cur = state.observations || [];
    setState({ ...state, observations: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] });
  };
  const selected = state.observations || [];

  return (
    <ScreenShell
      eyebrow="STEP 01 · 자료 분석"
      title="자료로 읽는 비밀 연락 작전"
      subtitle="역사적 맥락 자료와 가상 시나리오를 함께 살펴보고, 작전 설계에 활용할 단서를 골라보세요."
      footer={<NavBar {...nav} canNext={selected.length >= 2} />}
    >
      {/* ── 역사적 맥락 (실제 기록 기반) ── */}
      <div className="section-badge section-badge--history">📚 역사적 맥락 자료</div>
      <div className="grid grid-2">
        <div className="stack">
          <div className="img-frame" style={{ aspectRatio: "4/5" }}>
            <ImgWithFallback
              src="assets/history-doc.jpg"
              alt="역사 자료 이미지"
              fallbackLabel="역사 자료 이미지"
              fallbackHint={"독립운동 관련 사료 사진\n(국가보훈부·공공누리 자료 권장)"}
              style={{ aspectRatio: "4/5" }}
            />
          </div>
          <div className="caption">
            <span className="tag">1930년대 추정</span>
            <span className="tag">한국독립운동사 기록</span>
          </div>
        </div>
        <div className="stack">
          <div className="history-context">
            <div className="history-context__title">역사적 맥락</div>
            <p>
              1930년대 독립운동가들의 비밀 연락 활동은 주로 야간에 이루어졌습니다.
              당시 기록에 따르면 달빛이 약한 날, 마을을 우회하는 경로,
              별자리를 활용한 방향 판단 등이 연락원의 생존 전략이었습니다.
            </p>
            <p>
              이러한 이동 방식은 천문 환경에 대한 깊은 이해를 필요로 했으며,
              이는 당시 독립운동가들의 지혜와 생존 의지를 보여줍니다.
            </p>
            <div className="history-context__source">
              ※ 위 내용은 독립운동사 연구 자료를 바탕으로 교육용으로 재구성한 것입니다.
            </div>
          </div>
        </div>
      </div>

      {/* ── 가상 시나리오 (창작) ── */}
      <div className="section-badge section-badge--fiction">✍ 교육용 가상 시나리오</div>
      <div className="grid grid-2">
        <div className="excerpt">
          <div className="excerpt__label">가상의 연락원 일지 — 교육 목적 창작</div>
          <p>
            「…보름이 가까운 밤은 길이 너무 환하여 강가의 갈대밭조차
            제 그림자를 드러낸다. 사람의 눈을 피하려면 달이 늦게 뜨는
            그믐 무렵을 골라야 한다. 북녘 별을 등지고 동쪽 산자락으로
            빠지면 새벽이 오기 전에 마을 어귀에 닿을 수 있다…」
          </p>
          <div className="excerpt__source">— 교육용 창작 일지 (가상의 인물·상황, 실존 인물 아님)</div>
        </div>
        <div className="stack">
          <div className="question">
            <div className="question__label">탐구 질문</div>
            <h3>위 자료에서 작전 설계에 활용할 수 있는 단서는?</h3>
            <p className="muted">관련 항목을 모두 선택하세요. (최소 2개)</p>
          </div>
          <div className="stack">
            {observations.map(o => (
              <button
                key={o.id}
                className="option"
                aria-pressed={selected.includes(o.id)}
                onClick={() => toggle(o.id)}
              >
                <span className="option__indicator"></span>
                <span>{o.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

/* ============================================================
   3. 달의 위상
   ============================================================ */
function MoonPhaseScreen({ state, setState, ...nav }) {
  const phases = [
    {
      id: "full", name: "보름달", icon: "full",
      pros: ["지형·지물이 잘 보임", "근거리 식별 용이"],
      cons: ["연락원 모습 노출", "그림자까지 드러남", "검문 위험 매우 높음"],
      risk: "high",
    },
    {
      id: "half", name: "상현달·하현달", icon: "half",
      pros: ["적당한 가시성 확보", "기본 지형 인지 가능"],
      cons: ["중간 정도의 노출 위험", "월몰 시점 계산 필요"],
      risk: "mid",
    },
    {
      id: "new", name: "그믐·초승달", icon: "new",
      pros: ["은신 가능성 매우 높음", "별빛 항법에 유리"],
      cons: ["발 디딤이 어려움", "근거리 식별 곤란"],
      risk: "low",
    },
  ];

  return (
    <ScreenShell
      eyebrow="STEP 02 · 달의 위상"
      title="어느 달밤이 가장 안전한가?"
      subtitle="세 가지 달의 위상을 비교하고, 작전에 적합한 조건을 골라보세요."
      footer={<NavBar {...nav} canNext={!!state.moonPhase} />}
    >
      <div className="grid grid-3">
        {phases.map(p => (
          <button
            key={p.id}
            className={"phase-card" + (state.moonPhase === p.id ? " is-selected" : "")}
            onClick={() => setState({ ...state, moonPhase: p.id })}
          >
            <div className="phase-card__moon"><MoonIcon variant={p.icon} /></div>
            <div className="phase-card__name">{p.name}</div>
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
    </ScreenShell>
  );
}

function MoonIcon({ variant }) {
  if (variant === "full") return (
    <svg viewBox="0 0 80 80" width="72" height="72">
      <defs>
        <radialGradient id="mg-full" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#fff8e8"/>
          <stop offset="70%" stopColor="#f5e6a8"/>
          <stop offset="100%" stopColor="#d4b15a"/>
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="28" fill="url(#mg-full)"/>
      <circle cx="32" cy="34" r="3"   fill="#c9a040" opacity="0.25"/>
      <circle cx="50" cy="46" r="4.5" fill="#c9a040" opacity="0.18"/>
      <circle cx="44" cy="27" r="2.2" fill="#c9a040" opacity="0.22"/>
      <circle cx="28" cy="48" r="2.5" fill="#c9a040" opacity="0.15"/>
    </svg>
  );
  if (variant === "half") return (
    <svg viewBox="0 0 80 80" width="72" height="72">
      <defs>
        <radialGradient id="mg-half" cx="70%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff8e8"/>
          <stop offset="100%" stopColor="#d4b15a"/>
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="28" fill="#0e1a35"/>
      <path d="M40 12 A28 28 0 0 1 40 68 Z" fill="url(#mg-half)"/>
      <circle cx="40" cy="40" r="28" fill="none" stroke="#2a3a60" strokeWidth="0.8"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 80 80" width="72" height="72">
      <defs>
        <radialGradient id="mg-new" cx="30%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#e8d070"/>
          <stop offset="100%" stopColor="#b89040"/>
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="28" fill="#0e1a35"/>
      <path d="M50 14 A28 28 0 1 0 50 66 A22 22 0 1 1 50 14 Z" fill="url(#mg-new)" opacity="0.9"/>
      <circle cx="40" cy="40" r="28" fill="none" stroke="#2a3a60" strokeWidth="0.8"/>
    </svg>
  );
}

/* ============================================================
   4. 월출·월몰 타임라인
   ============================================================ */
function TimelineScreen({ state, setState, ...nav }) {
  const slots = [
    { id: "dusk",     label: "박명 종료 직후", time: "19:40 ~ 20:30", risk: "high",
      desc: "황혼이 남아 실루엣이 뚜렷이 드러납니다. 노출 위험이 가장 높습니다." },
    { id: "premoon",  label: "월출 직전",      time: "20:30 ~ 21:50", risk: "low",
      desc: "달이 아직 뜨지 않아 가장 어두운 시간대. 은신에 유리합니다." },
    { id: "midmoon",  label: "월출 ~ 자정",    time: "21:50 ~ 00:00", risk: "mid",
      desc: "달이 점점 높이 올라 가시성이 회복됩니다. 주의가 필요합니다." },
    { id: "postmoon", label: "월몰 직후",       time: "03:30 ~ 05:00", risk: "low",
      desc: "달이 진 뒤 깊은 어둠이 다시 찾아옵니다. 새벽 전 이동에 유리합니다." },
  ];
  const events = [
    { t: 0,  label: "일몰",     sub: "19:25" },
    { t: 22, label: "박명 종료", sub: "20:30" },
    { t: 50, label: "월출",     sub: "21:50" },
    { t: 88, label: "월몰",     sub: "03:30" },
  ];

  return (
    <ScreenShell
      eyebrow="STEP 03 · 시간대 분석"
      title="언제 움직여야 하는가?"
      subtitle="일몰·박명·월출·월몰 타임라인을 보고 이동에 적합한 시간대를 골라보세요."
      footer={<NavBar {...nav} canNext={!!state.timeSlot} />}
    >
      <div className="timeline">
        <div className="timeline__legend">
          <span><i style={{ background: "linear-gradient(90deg,#7055a0,#3a4d8a)" }} /> 박명</span>
          <span><i style={{ background: "rgba(232,207,122,0.55)" }} /> 달이 뜬 시간</span>
          <span><i style={{ background: "#0a0d1a", border: "1px solid rgba(232,207,122,0.3)" }} /> 깊은 어둠</span>
        </div>
        <div className="timeline__bar">
          <div className="timeline__band timeline__band--dusk"  style={{ left: "0%",  width: "22%" }} />
          <div className="timeline__band timeline__band--dark"  style={{ left: "22%", width: "28%" }} />
          <div className="timeline__band timeline__band--moon"  style={{ left: "50%", width: "38%" }} />
          <div className="timeline__band timeline__band--dark"  style={{ left: "88%", width: "12%" }} />
          {events.map((e, i) => (
            <div key={i} className="timeline__event" style={{ left: `${e.t}%` }}>
              <div className="timeline__tick" />
              <div className="timeline__event-label">
                <strong>{e.label}</strong><span>{e.sub}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="timeline__hours">
          <span>19:00</span><span>21:00</span><span>23:00</span><span>01:00</span><span>03:00</span><span>05:00</span>
        </div>
      </div>

      <div className="grid grid-4">
        {slots.map(s => (
          <button
            key={s.id}
            className={"slot-card" + (state.timeSlot === s.id ? " is-selected" : "")}
            onClick={() => setState({ ...state, timeSlot: s.id })}
          >
            <span className={`tag tag--risk-${s.risk}`}>
              위험 {s.risk === "high" ? "높음 ▲" : s.risk === "mid" ? "보통 ●" : "낮음 ▼"}
            </span>
            <div className="slot-card__time">{s.time}</div>
            <div className="slot-card__label">{s.label}</div>
            <p className="slot-card__desc">{s.desc}</p>
          </button>
        ))}
      </div>
    </ScreenShell>
  );
}

/* ============================================================
   5. 북극성 — 실제 별자리 좌표 기반 천구도
   ============================================================ */

/* 실제 밤하늘 주요 별자리 데이터 (적경·적위 → 화면 좌표 변환)
   북위 37° 기준, 자정(0h LST) 기준 북쪽 하늘 투영 */
const STAR_CATALOG = [
  /* 북극성 */          { name: "Polaris (α UMi)",  x: 200, y: 72,  r: 3.8, mag: 2.0,  color: "#fff8e0", glow: true },
  /* 북두칠성 */
  { name: "α UMa (두베)", x: 148, y: 148, r: 2.8, mag: 1.8,  color: "#ffe8b8" },
  { name: "β UMa (메라크)", x: 168, y: 168, r: 2.4, mag: 2.4,  color: "#ffe0a0" },
  { name: "γ UMa (페크다)", x: 210, y: 178, r: 2.2, mag: 2.4,  color: "#fff0c8" },
  { name: "δ UMa (메그레즈)", x: 240, y: 162, r: 2.0, mag: 3.3,  color: "#fff0c8" },
  { name: "ε UMa (알리오트)", x: 268, y: 145, r: 2.8, mag: 1.8,  color: "#d8e8ff" },
  { name: "ζ UMa (미자르)", x: 286, y: 125, r: 2.5, mag: 2.3,  color: "#d8e8ff" },
  { name: "η UMa (알카이드)", x: 295, y: 100, r: 2.6, mag: 1.9,  color: "#c8d8ff" },
  /* 작은곰자리 일부 */
  { name: "β UMi (코카브)",  x: 174, y: 100, r: 2.2, mag: 2.1,  color: "#ffc880" },
  { name: "γ UMi (페르카드)", x: 192, y: 118, r: 1.8, mag: 3.1,  color: "#ffd898" },
  /* 카시오페이아 */
  { name: "α Cas (세게인)",  x: 310, y: 175, r: 2.2, mag: 2.2,  color: "#fff0c8" },
  { name: "β Cas (카프)",    x: 324, y: 155, r: 1.8, mag: 2.3,  color: "#e8f4ff" },
  { name: "γ Cas (나비)",    x: 340, y: 168, r: 2.5, mag: 2.5,  color: "#d0e8ff" },
  { name: "δ Cas (루크바)",  x: 358, y: 155, r: 1.8, mag: 2.7,  color: "#f0f4ff" },
  { name: "ε Cas (세긴)",   x: 374, y: 168, r: 1.6, mag: 3.4,  color: "#c8d8ff" },
  /* 케페우스 일부 */
  { name: "α Cep (알데라민)", x: 330, y: 108, r: 2.0, mag: 2.5,  color: "#f8f0e0" },
  { name: "β Cep (알피르크)", x: 350, y: 125, r: 1.8, mag: 3.2,  color: "#c8d4ff" },
  /* 드라코 일부 */
  { name: "γ Dra (에타닌)",  x: 292, y: 190, r: 2.0, mag: 2.2,  color: "#ffd880" },
  { name: "β Dra",           x: 275, y: 172, r: 1.6, mag: 2.8,  color: "#ffe0a0" },
];

/* 배경 랜덤 별 (결정적 시드) */
const BG_STARS = Array.from({ length: 120 }, (_, i) => {
  const x = ((i * 137 + 53) * 7 + 11) % 400;
  const y = ((i * 89 + 31) * 5 + 17) % 220;
  const r = [0.5, 0.5, 0.6, 0.8, 0.5, 0.5, 0.7, 0.5, 0.9, 0.5][i % 10];
  const op = 0.35 + (i % 6) * 0.1;
  return { x, y, r, op };
});

/* 은하수 경로 */
const MILKY_WAY_PATH = "M 0 220 Q 60 180 100 140 T 180 100 T 250 80 T 320 60 T 400 40";

function SkyChart({ selectedRoute }) {
  return (
    <svg viewBox="0 0 400 280" width="100%" height="auto" aria-label="북쪽 밤하늘 별자리 도식">
      {/* 배경 */}
      <defs>
        <radialGradient id="sky-grad" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#0e1a3a"/>
          <stop offset="100%" stopColor="#030608"/>
        </radialGradient>
        <filter id="star-glow">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="faint-glow">
          <feGaussianBlur stdDeviation="1.2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <rect width="400" height="280" fill="url(#sky-grad)"/>

      {/* 은하수 */}
      <path d={MILKY_WAY_PATH} stroke="rgba(200,220,255,0.06)" strokeWidth="28" fill="none"/>
      <path d={MILKY_WAY_PATH} stroke="rgba(200,220,255,0.04)" strokeWidth="14" fill="none"/>

      {/* 배경 별 */}
      {BG_STARS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.op}/>
      ))}

      {/* 산 실루엣 */}
      <path d="M0 260 L55 225 L110 248 L165 210 L220 235 L275 200 L330 222 L385 208 L400 215 L400 280 L0 280 Z"
        fill="#090e1e"/>
      <path d="M0 265 L30 252 L80 258 L130 250 L180 254 L230 248 L280 252 L340 246 L400 250 L400 280 L0 280 Z"
        fill="#060a18"/>

      {/* 자오선 (북극성 가이드라인) */}
      <line x1="200" y1="0" x2="200" y2="200" stroke="rgba(232,207,122,0.07)" strokeWidth="1" strokeDasharray="4 6"/>

      {/* 카시오페이아 연결선 */}
      <polyline points="310,175 324,155 340,168 358,155 374,168"
        stroke="rgba(200,220,255,0.45)" strokeWidth="0.7" fill="none"/>

      {/* 북두칠성 연결선 */}
      <polyline points="148,148 168,168 210,178 240,162 268,145 286,125 295,100"
        stroke="rgba(232,207,122,0.5)" strokeWidth="0.8" fill="none"/>

      {/* 작은곰자리 연결 (북극성 → β → γ) */}
      <polyline points="200,72 174,100 192,118"
        stroke="rgba(255,200,100,0.35)" strokeWidth="0.6" fill="none" strokeDasharray="3 3"/>

      {/* 북두칠성 → 북극성 가이드 화살표 */}
      <line x1="148" y1="148" x2="204" y2="76"
        stroke="rgba(232,207,122,0.55)" strokeWidth="0.5" strokeDasharray="5 4"/>
      <polygon points="200,68 206,82 194,82"
        fill="rgba(232,207,122,0.6)"/>

      {/* 배경별 아닌 주요 별들 */}
      {STAR_CATALOG.map((s, i) => (
        <g key={i} filter={s.glow ? "url(#star-glow)" : s.r >= 2.2 ? "url(#faint-glow)" : undefined}>
          <circle cx={s.x} cy={s.y} r={s.r} fill={s.color || "#fff"}/>
        </g>
      ))}

      {/* 북극성 강조 링 */}
      <circle cx="200" cy="72" r="10" fill="none" stroke="#e8cf7a" strokeWidth="0.7" opacity="0.6"/>
      <circle cx="200" cy="72" r="16" fill="none" stroke="#e8cf7a" strokeWidth="0.3" opacity="0.35"/>

      {/* 별자리 라벨 */}
      <text x="202" y="58" fill="#f5e6a8" fontSize="9.5" fontFamily="serif" textAnchor="middle" fontWeight="bold">북극성</text>
      <text x="202" y="49" fill="#c8b878" fontSize="7.5" fontFamily="monospace" textAnchor="middle">Polaris</text>

      <text x="215" y="192" fill="rgba(232,207,122,0.7)" fontSize="8" fontFamily="serif">북두칠성</text>
      <text x="215" y="202" fill="rgba(200,180,100,0.55)" fontSize="6.5" fontFamily="monospace">Ursa Major</text>

      <text x="330" y="145" fill="rgba(200,220,255,0.7)" fontSize="8" fontFamily="serif">카시오페이아</text>
      <text x="330" y="155" fill="rgba(160,190,220,0.5)" fontSize="6.5" fontFamily="monospace">Cassiopeia</text>

      {/* 방위 나침반 */}
      <g transform="translate(36, 248)">
        <circle r="18" fill="rgba(6,9,20,0.8)" stroke="rgba(232,207,122,0.4)" strokeWidth="0.8"/>
        <text y="-22" textAnchor="middle" fill="#e8cf7a" fontSize="11" fontFamily="serif" fontWeight="bold">N</text>
        <text y="28" textAnchor="middle" fill="#4a5a80" fontSize="8">S</text>
        <text x="22" y="3"  textAnchor="middle" fill="#4a5a80" fontSize="8">E</text>
        <text x="-22" y="3" textAnchor="middle" fill="#4a5a80" fontSize="8">W</text>
        <line x1="0" y1="4" x2="0" y2="-14" stroke="#e8cf7a" strokeWidth="1.5"/>
        <circle cx="0" cy="-14" r="2" fill="#e8cf7a"/>
      </g>

      {/* 위도·시각 정보 */}
      <text x="390" y="14" fill="rgba(200,180,100,0.6)" fontSize="7" fontFamily="monospace" textAnchor="end">북위 37° · 밤 22:00</text>
      <text x="390" y="24" fill="rgba(160,150,100,0.5)" fontSize="6.5" fontFamily="monospace" textAnchor="end">교육용 천구도 (가상 작전 시각)</text>
    </svg>
  );
}

function PolarisScreen({ state, setState, ...nav }) {
  const options = [
    { id: "yes",     label: "그렇다 — 북극성과 북두칠성으로 북쪽을 정확히 잡을 수 있다." },
    { id: "partial", label: "부분적으로 — 구름·산세에 따라 보이지 않는 구간이 있다." },
    { id: "no",      label: "아니다 — 별만으로 방향을 잡기는 어렵다." },
  ];

  return (
    <ScreenShell
      eyebrow="STEP 04 · 항법"
      title="북극성으로 방향을 잡을 수 있는가?"
      subtitle="실제 별자리 위치를 참고하여 야간 방향 판단 가능성을 평가해보세요."
      footer={<NavBar {...nav} canNext={!!state.polaris} />}
    >
      <div className="grid grid-2">
        <div className="skychart">
          <SkyChart />
          <div className="skychart__caption">
            <span className="tag">북위 37° · 밤 10시 기준</span>
            <span className="tag">북극성 고도 약 37°</span>
            <span className="tag tag--note">교육용 천구도</span>
          </div>
          <div className="skychart__guide">
            <div className="skychart__guide-item">
              <span className="skychart__guide-dot" style={{ background: "#e8cf7a" }}></span>
              북두칠성 국자 끝 두 별(두베·메라크)을 5배 연장 → 북극성
            </div>
            <div className="skychart__guide-item">
              <span className="skychart__guide-dot" style={{ background: "#c8d8ff" }}></span>
              카시오페이아 W자 중심에서도 북극성 방향 확인 가능
            </div>
          </div>
        </div>

        <div className="stack">
          <div className="question">
            <div className="question__label">탐구 질문</div>
            <h3>오늘 밤, 별만으로 방향을 정확히 잡을 수 있을까요?</h3>
            <p className="muted">천구도를 참고하여 가장 타당한 판단을 고르세요.</p>
          </div>
          <div className="stack">
            {options.map(o => (
              <button
                key={o.id}
                className="option"
                aria-pressed={state.polaris === o.id}
                onClick={() => setState({ ...state, polaris: o.id })}
              >
                <span className="option__indicator"></span>
                <span>{o.label}</span>
              </button>
            ))}
          </div>
          <div className="polaris-facts">
            <div className="polaris-facts__title">북극성 관측 사실</div>
            <ul>
              <li>북극성(Polaris, α UMi)은 천구 북극에서 약 0.7° 떨어져 있어 거의 움직이지 않는다.</li>
              <li>북위 37° 서울 기준, 지평선 위 약 37° 고도에서 관측된다.</li>
              <li>맑은 날 맨눈으로도 쉽게 찾을 수 있다 (2.0등급).</li>
              <li>구름이 끼거나 산세가 높을 경우 시야가 차단될 수 있다.</li>
            </ul>
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

/* ============================================================
   6. 경로 선택 — 지형 강화 지도
   ============================================================ */
function RouteScreen({ state, setState, ...nav }) {
  const routes = [
    {
      id: "A", name: "강변 우회로",
      length: "12km", time: "약 4시간",
      exposure: "low", difficulty: "mid", hide: "high",
      desc: "갈대밭·강안 둑을 따라 이동. 마을을 크게 우회하여 노출 위험이 낮으나 거리가 멂.",
    },
    {
      id: "B", name: "산자락 능선",
      length: "9km", time: "약 3시간",
      exposure: "mid", difficulty: "high", hide: "high",
      desc: "능선을 따라 빠르게 이동 가능. 야간 산행 난이도가 높고 발소리 위험이 있음.",
    },
    {
      id: "C", name: "관도 직선로",
      length: "7km", time: "약 2시간",
      exposure: "high", difficulty: "low", hide: "low",
      desc: "큰 길을 직진. 가장 빠르지만 검문소와 마주칠 가능성이 가장 높음.",
    },
  ];

  return (
    <ScreenShell
      eyebrow="STEP 05 · 경로"
      title="어느 길로 갈 것인가?"
      subtitle="세 경로의 노출도·난이도·은신 가능성을 비교하고 하나를 선택하세요."
      footer={<NavBar {...nav} canNext={!!state.route} />}
    >
      <div className="route-map">
        <RouteMapSVG selected={state.route} />
      </div>
      <div className="grid grid-3" style={{ marginTop: 20 }}>
        {routes.map(r => (
          <button
            key={r.id}
            className={"route-card" + (state.route === r.id ? " is-selected" : "")}
            onClick={() => setState({ ...state, route: r.id })}
          >
            <div className="route-card__head">
              <div className="route-card__id">경로 {r.id}</div>
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
    </ScreenShell>
  );
}

function RouteMapSVG({ selected }) {
  return (
    <svg viewBox="0 0 680 240" width="100%" height="auto" aria-label="이동 경로 지도">
      <defs>
        <linearGradient id="river-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1a3060"/>
          <stop offset="50%" stopColor="#213875"/>
          <stop offset="100%" stopColor="#1a3060"/>
        </linearGradient>
        <linearGradient id="mountain-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e2d4a"/>
          <stop offset="100%" stopColor="#111c35"/>
        </linearGradient>
        <filter id="shadow-soft">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.4"/>
        </filter>
      </defs>

      {/* 기본 배경 — 논밭 평지 */}
      <rect width="680" height="240" fill="#0d1828"/>
      {/* 논 패턴 */}
      {Array.from({length:6}).map((_,i) => (
        <rect key={i} x={60 + i*90} y="150" width="80" height="55" rx="2"
          fill="none" stroke="rgba(40,80,50,0.3)" strokeWidth="0.8"/>
      ))}

      {/* 강 (넓게) */}
      <path d="M0 182 Q120 162 240 178 Q360 194 480 172 Q580 156 680 165"
        stroke="url(#river-grad)" strokeWidth="22" fill="none" opacity="0.85"/>
      <path d="M0 182 Q120 162 240 178 Q360 194 480 172 Q580 156 680 165"
        stroke="rgba(60,100,180,0.2)" strokeWidth="32" fill="none"/>
      {/* 강 반짝임 */}
      <path d="M40 178 Q100 168 160 175" stroke="rgba(180,210,255,0.2)" strokeWidth="2" fill="none"/>
      <path d="M320 182 Q380 172 440 178" stroke="rgba(180,210,255,0.15)" strokeWidth="2" fill="none"/>

      {/* 산 (복층) */}
      <path d="M100 115 L145 72 L200 105 L255 58 L315 108 L370 75 L425 112 L480 88 L530 115 L540 135 L90 135 Z"
        fill="url(#mountain-grad)" filter="url(#shadow-soft)"/>
      <path d="M90 135 L145 110 L200 128 L260 98 L320 122 L375 105 L430 125 L490 108 L540 130 L540 140 L90 140 Z"
        fill="#18263f" opacity="0.7"/>
      {/* 눈 덮인 봉우리 */}
      <path d="M145 72 L155 80 L135 80 Z" fill="rgba(220,230,255,0.35)"/>
      <path d="M255 58 L268 68 L242 68 Z" fill="rgba(220,230,255,0.4)"/>
      <path d="M370 75 L381 84 L359 84 Z" fill="rgba(220,230,255,0.3)"/>

      {/* 숲 (강변) */}
      {[60,110,160,500,550,600].map((x,i) => (
        <ellipse key={i} cx={x} cy="162" rx="12" ry="8" fill="rgba(20,60,30,0.6)"/>
      ))}
      {/* 갈대밭 */}
      {Array.from({length:12}).map((_,i) => (
        <line key={i} x1={80+i*12} y1="188" x2={82+i*12} y2="175"
          stroke="rgba(120,160,60,0.4)" strokeWidth="1.5"/>
      ))}

      {/* 마을 (출발) */}
      <g transform="translate(62,155)">
        <rect x="-18" y="-14" width="36" height="28" rx="3" fill="#1a2952" opacity="0.9"/>
        <rect x="-14" y="-10" width="12" height="18" rx="1" fill="#243a6a"/>
        <rect x="2"   y="-10" width="12" height="18" rx="1" fill="#243a6a"/>
        <polygon points="-18,-14 0,-24 18,-14" fill="#1e3266"/>
        <rect x="-2" y="-4" width="4" height="8" fill="#0a1228"/>
      </g>
      {/* 마을 (도착) */}
      <g transform="translate(618,156)">
        <rect x="-18" y="-14" width="36" height="28" rx="3" fill="#1a2952" opacity="0.9"/>
        <rect x="-14" y="-10" width="12" height="18" rx="1" fill="#243a6a"/>
        <rect x="2"   y="-10" width="12" height="18" rx="1" fill="#243a6a"/>
        <polygon points="-18,-14 0,-24 18,-14" fill="#1e3266"/>
        <rect x="-2" y="-4" width="4" height="8" fill="#0a1228"/>
      </g>

      {/* 검문소 표시 (관도 위) */}
      <g transform="translate(340,155)">
        <rect x="-12" y="-8" width="24" height="16" rx="2" fill="#5a1a1a" opacity="0.9"/>
        <line x1="-12" y1="0" x2="12" y2="0" stroke="#c97064" strokeWidth="1.5"/>
        <text x="0" y="28" textAnchor="middle" fill="#c97064" fontSize="8" fontFamily="serif">검문소</text>
      </g>

      {/* 경로 A 강변 */}
      <path d="M62 162 Q160 195 280 184 Q400 174 540 162 T 618 162"
        stroke="#6fb98f" strokeWidth={selected==="A"?3:2} fill="none"
        strokeDasharray="7 5" opacity={selected==="A"?1:0.45}/>
      <text x="270" y="212" fill="#6fb98f" fontSize="11" fontFamily="serif" opacity={selected==="A"?1:0.55}>A · 강변 우회로</text>

      {/* 경로 B 능선 */}
      <path d="M62 155 Q100 110 160 95 Q240 78 340 82 Q430 86 530 100 T 618 155"
        stroke="#d4b15a" strokeWidth={selected==="B"?3:2} fill="none"
        strokeDasharray="7 5" opacity={selected==="B"?1:0.45}/>
      <text x="310" y="68" fill="#d4b15a" fontSize="11" fontFamily="serif" opacity={selected==="B"?1:0.55}>B · 산자락 능선</text>

      {/* 경로 C 관도 */}
      <path d="M62 155 L618 155"
        stroke="#c97064" strokeWidth={selected==="C"?3:2} fill="none"
        strokeDasharray="7 5" opacity={selected==="C"?1:0.45}/>
      <text x="310" y="147" fill="#c97064" fontSize="11" fontFamily="serif" opacity={selected==="C"?1:0.55}>C · 관도 직선로</text>

      {/* 출발·도착 마커 */}
      <circle cx="62"  cy="155" r="7" fill="#e8cf7a" filter="url(#shadow-soft)"/>
      <circle cx="618" cy="155" r="7" fill="#e8cf7a" filter="url(#shadow-soft)"/>
      <text x="62"  y="228" textAnchor="middle" fill="#e8cf7a" fontSize="11" fontFamily="serif">출발</text>
      <text x="618" y="228" textAnchor="middle" fill="#e8cf7a" fontSize="11" fontFamily="serif">도착</text>

      {/* 범례 */}
      <text x="10" y="14" fill="rgba(200,180,100,0.6)" fontSize="7.5" fontFamily="monospace">가상의 작전 지형도 — 교육용 창작</text>
    </svg>
  );
}

function Metric({ label, level, invert }) {
  const rawScore = level === "high" ? 3 : level === "mid" ? 2 : 1;
  // invert=true → 높을수록 좋은 지표 (은신 가능성), colorVar = good if high
  // invert=false → 높을수록 나쁜 지표 (노출 위험, 난이도), colorVar = bad if high
  const goodScore = invert ? rawScore : 4 - rawScore;
  const colorVar = goodScore >= 3 ? "var(--color-risk-low)"
                 : goodScore === 2 ? "var(--color-risk-mid)"
                 : "var(--color-risk-high)";
  return (
    <div className="metric">
      <div className="metric__label">{label}</div>
      <div className="metric__bars">
        {[1, 2, 3].map(i => (
          <span key={i} style={{ background: i <= rawScore ? colorVar : "var(--color-night-500)" }} />
        ))}
      </div>
      <div className="metric__value" style={{ color: colorVar }}>
        {level === "high" ? "높음" : level === "mid" ? "보통" : "낮음"}
      </div>
    </div>
  );
}

/* ============================================================
   7. 최종 작전 계획
   ============================================================ */
function PlanScreen({ state, setState, operationNo, ...nav }) {
  const phaseLabel  = { full: "보름달", half: "상현·하현달", new: "그믐·초승달" };
  const slotLabel   = {
    dusk:     "박명 종료 직후 (19:40–20:30)",
    premoon:  "월출 직전 (20:30–21:50)",
    midmoon:  "월출 ~ 자정 (21:50–00:00)",
    postmoon: "월몰 직후 (03:30–05:00)",
  };
  const routeLabel  = { A: "경로 A · 강변 우회로", B: "경로 B · 산자락 능선", C: "경로 C · 관도 직선로" };
  const polarisLabel = {
    yes: "북극성 항법 가능", partial: "부분적으로 가능", no: "별 항법 불가",
  };

  return (
    <ScreenShell
      eyebrow="STEP 06 · 작전 계획서"
      title="별빛 작전 계획서 작성"
      subtitle="지금까지의 선택을 정리하고, 그 근거를 직접 서술해보세요."
      footer={<NavBar {...nav} nextLabel="결과 확인" canNext={!!state.rationale && state.rationale.length >= 20} />}
    >
      <div className="grid grid-2">
        <div className="plan-sheet">
          <div className="plan-sheet__head">
            <div className="plan-sheet__title">작전 계획서</div>
            <div className="plan-sheet__seal">機密</div>
          </div>
          <dl className="plan-sheet__list">
            <div><dt>작전명</dt><dd>별빛 작전 / 第 {operationNo}호</dd></div>
            <div><dt>달의 위상</dt><dd>{phaseLabel[state.moonPhase] || "—"}</dd></div>
            <div><dt>이동 시간대</dt><dd>{slotLabel[state.timeSlot] || "—"}</dd></div>
            <div><dt>방향 판단</dt><dd>{polarisLabel[state.polaris] || "—"}</dd></div>
            <div><dt>이동 경로</dt><dd>{routeLabel[state.route] || "—"}</dd></div>
            <div><dt>채택 단서</dt><dd>{(state.observations || []).length}건</dd></div>
          </dl>
          <div className="plan-sheet__notice">
            ※ 교육용 가상 작전 계획서입니다. 실존 인물·사건과 무관합니다.
          </div>
        </div>

        <div className="stack">
          <div className="question">
            <div className="question__label">작전 근거 서술</div>
            <h3>왜 이 조합이 가장 적절하다고 판단했나요?</h3>
            <p className="muted">달빛·시간대·방향·경로의 관계를 연결해 2–4문장으로 적어주세요.</p>
          </div>
          <textarea
            className="textarea"
            rows={10}
            placeholder="예) 그믐 무렵을 골라 달빛 노출을 줄이고, 월출 직전의 가장 어두운 시간대에 강변 우회로로 이동한다. 별빛이 부족해 정밀한 항법은 어렵지만 강의 흐름을 따라 방향을 유지할 수 있다…"
            value={state.rationale || ""}
            onChange={e => setState({ ...state, rationale: e.target.value })}
          />
          <div className="textarea__counter">
            <span style={{ color: (state.rationale||"").length >= 20 ? "var(--color-risk-low)" : "var(--color-text-dim)" }}>
              {(state.rationale || "").length}자
            </span>
            {" "}/ 최소 20자
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

/* ============================================================
   8. 결과 + 보훈 성찰 (성찰문 입력 추가)
   ============================================================ */
function calcScore(state) {
  /* ── 노출 위험도: 높을수록 위험 (0–100) ── */
  let exposure = 0;
  exposure += { full: 90, half: 50, new: 20 }[state.moonPhase]  || 50;
  exposure += { dusk: 85, premoon: 15, midmoon: 55, postmoon: 20 }[state.timeSlot] || 50;
  exposure += { A: 15, B: 40, C: 85 }[state.route] || 50;
  exposure = Math.min(100, Math.round(exposure / 3));

  /* ── 이동 난이도: 높을수록 힘듦 (0–100) ── */
  let difficulty = 0;
  difficulty += { A: 55, B: 85, C: 25 }[state.route] || 50;
  difficulty += { dusk: 30, premoon: 60, midmoon: 50, postmoon: 70 }[state.timeSlot] || 50;
  difficulty = Math.min(100, Math.round(difficulty / 2));

  /* ── 방향 판단 가능성: 높을수록 좋음 (0–100) ── */
  let direction = 0;
  direction += { yes: 90, partial: 55, no: 25 }[state.polaris]  || 50;
  direction += { full: 30, half: 55, new: 75 }[state.moonPhase] || 50;  // 그믐 = 별이 잘 보임
  direction = Math.min(100, Math.round(direction / 2));

  /* ── 종합 작전 적절성 ── */
  const safety = 100 - exposure;
  const total  = Math.round((safety * 0.45 + (100 - difficulty) * 0.25 + direction * 0.30));

  return { exposure, difficulty, direction, total };
}

function ResultScreen({ state, setState, onRestart, ...nav }) {
  const s = useMemo(() => calcScore(state), [state]);

  const reflections = [
    "당신이 설계한 작전은 누군가의 실제 삶과 맞닿아 있습니다. 그분들이 감당했던 '선택의 무게'는 무엇이었을까요?",
    "정보가 부족하고 위험이 큰 상황에서, 당신은 어떤 가치를 가장 우선했나요?",
    "오늘의 우리는 그분들의 선택으로부터 무엇을 이어받고 있을까요?",
  ];

  const handleShare = () => {
    const text = `[별빛 작전 결과]\n종합 적절성: ${s.total}점\n노출 위험: ${s.exposure} | 이동 난이도: ${s.difficulty} | 방향 판단: ${s.direction}\n\n성찰: ${state.reflection || "(미작성)"}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => alert("결과가 클립보드에 복사되었습니다.\nPadlet 등에 붙여넣기 하세요."));
    } else {
      alert(text);
    }
  };

  return (
    <ScreenShell
      eyebrow="STEP 07 · 결과 · 성찰"
      title="작전 결과 보고"
      subtitle="설계한 작전을 4가지 지표로 점검하고, 보훈의 의미를 함께 새겨봅니다."
      footer={
        <div className="navbar">
          <button className="btn btn--ghost" onClick={nav.onPrev}>← 계획서로</button>
          <div />
          <button className="btn btn--primary" onClick={onRestart}>처음으로 ↺</button>
        </div>
      }
    >
      <div className="grid grid-2">
        {/* 점수 */}
        <div className="stack">
          <ScoreRow
            label="노출 위험도"
            value={s.exposure}
            tone={s.exposure >= 70 ? "bad" : s.exposure >= 40 ? "mid" : "good"}
            hint={s.exposure >= 70 ? "노출 가능성 매우 높음 — 선택 재검토 필요" : s.exposure >= 40 ? "주의 필요한 수준" : "비교적 안전한 작전"}
            higherIsBad
          />
          <ScoreRow
            label="이동 난이도"
            value={s.difficulty}
            tone={s.difficulty >= 70 ? "bad" : s.difficulty >= 40 ? "mid" : "good"}
            hint={s.difficulty >= 70 ? "험난한 행군 — 체력 소모 매우 큼" : s.difficulty >= 40 ? "보통 수준의 이동 부담" : "비교적 수월한 경로"}
            higherIsBad
          />
          <ScoreRow
            label="방향 판단 가능성"
            value={s.direction}
            tone={s.direction >= 65 ? "good" : s.direction >= 40 ? "mid" : "bad"}
            hint={s.direction >= 65 ? "별·달 항법 안정적" : s.direction >= 40 ? "보조 수단 필요" : "방향 상실 위험"}
          />
          <div className="result-total">
            <div className="result-total__label">종합 작전 적절성</div>
            <div className="result-total__num">{s.total}</div>
            <div className="result-total__bar"><span style={{ width: `${s.total}%` }} /></div>
            <div className="result-total__note">
              {s.total >= 72 ? "✦ 정교하고 균형 잡힌 작전입니다."
                : s.total >= 52 ? "● 현장 변수에 따라 조정이 필요합니다."
                : "▲ 위험 요소가 큽니다. 달·시간대·경로를 재검토하세요."}
            </div>
          </div>
        </div>

        {/* 성찰 */}
        <div className="reflection">
          <div className="eyebrow">보훈 성찰</div>
          <h3>잠시, 멈추어 생각해 봅니다.</h3>
          <ol>
            {reflections.map((q, i) => <li key={i}>{q}</li>)}
          </ol>
          <div className="reflection__quote">
            "별빛 하나에 의지해 산을 넘던 그 밤들이,<br />
            오늘의 우리에게 길을 물어봅니다."
          </div>
          <div className="question" style={{ marginTop: 8 }}>
            <div className="question__label">성찰 노트</div>
            <p className="muted" style={{ fontSize: "var(--text-sm)", marginBottom: 8 }}>
              위 질문 중 하나를 골라 자유롭게 적어보세요.
            </p>
          </div>
          <textarea
            className="textarea"
            rows={5}
            placeholder="예) 이 활동을 통해 독립운동가들이 얼마나 치밀하게 환경을 관찰하고 행동했는지를 느꼈습니다…"
            value={state.reflection || ""}
            onChange={e => setState({ ...state, reflection: e.target.value })}
          />
          <div className="reflection__actions">
            <button className="btn btn--ghost" onClick={handleShare}>📤 결과 공유 (클립보드)</button>
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

function ScoreRow({ label, value, tone, hint }) {
  const colorVar = tone === "good" ? "var(--color-risk-low)"
                 : tone === "mid"  ? "var(--color-risk-mid)"
                 : "var(--color-risk-high)";
  return (
    <div className="score-row">
      <div className="score-row__head">
        <span className="score-row__label">{label}</span>
        <span className="score-row__num" style={{ color: colorVar }}>{value}</span>
      </div>
      <div className="score-row__bar">
        <span style={{ width: `${value}%`, background: colorVar }} />
      </div>
      <div className="score-row__hint">{hint}</div>
    </div>
  );
}

/* ============================================================
   Export
   ============================================================ */
Object.assign(window, {
  IntroScreen, HistoryCardScreen, MoonPhaseScreen, TimelineScreen,
  PolarisScreen, RouteScreen, PlanScreen, ResultScreen,
});
