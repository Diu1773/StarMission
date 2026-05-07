import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { recordsApi } from "../api/records";
import { MOON_LABELS, TIME_LABELS, ROUTE_LABELS } from "../data/options";
import { useAuth } from "../context/AuthContext";

function ScoreRow({ label, value, tone, hint }) {
  const colorVar =
    tone === "good" ? "var(--color-risk-low)"
    : tone === "mid" ? "var(--color-risk-mid)"
    : "var(--color-risk-high)";
  return (
    <div className="score-row">
      <div className="score-row__head">
        <span className="score-row__label">{label}</span>
        <span className="score-row__num" style={{ color: colorVar }}>{value}</span>
      </div>
      <div className="score-row__bar">
        <span style={{ width: `${typeof value === "number" ? value : 50}%`, background: colorVar }} />
      </div>
      {hint && <div className="score-row__hint">{hint}</div>}
    </div>
  );
}

const LEVEL_TONE = {
  높음: { bad: "bad", good: "good" },
  중간: { bad: "mid", good: "mid" },
  낮음: { bad: "good", good: "bad" },
};

// 백엔드 없이도 점수·피드백 계산 (Python scoring.py 동일 로직)
function calcLocalScore(moon, time, route) {
  const moonExp  = { full:90, half:50, new:20 };
  const timeExp  = { afterTwilight:85, beforeMoonrise:15, moonHigh:55, dawn:25 };
  const routeExp = { routeA:75, routeB:20, routeC:50 };
  const exposure = Math.min(100, Math.round(((moonExp[moon]??50)+(timeExp[time]??50)+(routeExp[route]??50))/3));

  const routeMob = { routeA:65, routeB:85, routeC:30 };
  const timeMob  = { afterTwilight:30, beforeMoonrise:65, moonHigh:45, dawn:70 };
  const mobility = Math.min(100, Math.round(((routeMob[route]??50)+(timeMob[time]??50))/2));

  const moonNav  = { full:30, half:55, new:80 };
  const routeNav = { routeA:40, routeB:45, routeC:75 };
  const timeNav  = { afterTwilight:45, beforeMoonrise:85, moonHigh:50, dawn:60 };
  const nav = Math.min(100, Math.round(((moonNav[moon]??50)+(routeNav[route]??50)+(timeNav[time]??50))/3));

  const overall = Math.round((100-exposure)*0.45 + (100-mobility)*0.25 + nav*0.30);
  const lvBad = v => v>=70?'높음':v>=40?'중간':'낮음';
  const lvGood= v => v>=65?'높음':v>=40?'중간':'낮음';

  const moonL  = { full:'보름달', half:'상현달', new:'그믐달' };
  const timeL  = { afterTwilight:'박명 종료 직후', beforeMoonrise:'월출 전', moonHigh:'달이 높이 뜬 시간', dawn:'새벽' };
  const routeL = { routeA:'A 경로 (마을·도로)', routeB:'B 경로 (산지·숲)', routeC:'C 경로 (하천 주변)' };

  const parts = [];
  if(moon==='new') parts.push('그믐달을 선택하여 달빛 노출을 최소화했습니다. 은신에 매우 유리하지만 이동 중 발 디딤과 방향 판단에 주의가 필요합니다.');
  else if(moon==='half') parts.push('상현달은 적당한 가시성을 제공합니다. 월몰 시점을 함께 계산해 노출 위험을 줄이는 것이 중요합니다.');
  else parts.push('보름달은 밝은 달빛으로 노출 위험이 매우 높습니다. 완전한 은신이 어려운 조건입니다.');

  if(time==='beforeMoonrise') parts.push(`이동 시간으로 '${timeL[time]}'을 선택한 것은 탁월한 판단입니다. 가장 어두운 시간대로 은신에 가장 유리합니다.`);
  else if(time==='afterTwilight') parts.push(`'${timeL[time]}'은 아직 황혼이 남아 실루엣이 드러날 수 있습니다. 노출 위험이 높은 시간대입니다.`);
  else if(time==='moonHigh') parts.push(`'${timeL[time]}'은 달이 높이 떠 가시성이 좋지만, 그만큼 노출 위험도 높습니다.`);
  else parts.push(`'${timeL[time]}'은 박명이 시작되기 전 어둠을 활용할 수 있지만, 시간이 길어지면 새벽빛이 노출을 높일 수 있습니다.`);

  if(route==='routeB') parts.push(`${routeL[route]}은 산지와 숲을 우회해 은신에 유리합니다. 다만 야간 산행의 이동 난이도가 높아 체력 관리가 필요합니다.`);
  else if(route==='routeA') parts.push(`${routeL[route]}은 마을과 도로를 통과하므로 노출 위험이 높습니다. 빠른 이동이 가능하지만 감시와 검문 위험을 감수해야 합니다.`);
  else parts.push(`${routeL[route]}은 하천을 따라 방향을 파악하기 쉽습니다. 달빛 아래 강물이 반사되면 노출될 수 있으므로 주의가 필요합니다.`);

  if(overall>=72) parts.push(`종합 적절성 ${overall}점으로 정교하고 균형 잡힌 작전입니다.`);
  else if(overall>=52) parts.push(`종합 적절성 ${overall}점으로 현장 변수에 따라 조정이 필요한 수준입니다.`);
  else parts.push(`종합 적절성 ${overall}점으로 위험 요소가 큰 작전입니다. 달 조건, 이동 시간, 경로 중 하나 이상을 재검토해 보세요.`);

  return {
    exposure_risk: lvBad(exposure), mobility: lvBad(mobility),
    navigation: lvGood(nav),
    overall: overall>=72?'우수':overall>=52?'보통':'미흡',
    feedback_text: parts.join(' '),
  };
}

export default function ResultPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("starmission_result");
    if (!raw) { navigate("/mission"); return; }
    const data = JSON.parse(raw);
    setDraft(data);

    if (user) {
      // 로그인: 백엔드 저장 + AI 피드백
      recordsApi
        .create({
          selectedMoon: data.selectedMoon,
          selectedTime: data.selectedTime,
          selectedRoute: data.selectedRoute,
          reasonText: data.reasonText,
          reflectionText: data.reflectionText,
        })
        .then((res) => {
          setResult(res);
          setSaved(true);
          localStorage.removeItem("starmission_result");
          localStorage.removeItem("starmission_draft");
        })
        .catch((err) => {
          setError(err.message);
          // 백엔드 실패해도 로컬 점수는 보여줌
          setResult(calcLocalScore(data.selectedMoon, data.selectedTime, data.selectedRoute));
        });
    } else {
      // 비로그인: 로컬에서 즉시 계산
      setResult(calcLocalScore(data.selectedMoon, data.selectedTime, data.selectedRoute));
    }
  }, [navigate, user]);

  const handleManualSave = async () => {
    if (!draft || saving || saved) return;
    setSaving(true);
    setError(null);
    try {
      const res = await recordsApi.create({
        selectedMoon: draft.selectedMoon,
        selectedTime: draft.selectedTime,
        selectedRoute: draft.selectedRoute,
        reasonText: draft.reasonText,
        reflectionText: draft.reflectionText,
      });
      setResult(res);
      setSaved(true);
      localStorage.removeItem("starmission_result");
      localStorage.removeItem("starmission_draft");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!draft) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
        <div className="eyebrow">결과 불러오는 중…</div>
      </div>
    );
  }

  const feedback = result || {
    exposure_risk: "—",
    mobility: "—",
    navigation: "—",
    overall: "—",
    feedback_text: error ? `피드백을 불러오지 못했습니다: ${error}` : "피드백을 불러오는 중입니다…",
  };

  return (
    <div className="screen">
      <div className="app__brand">별빛 작전 · 보훈교육 시뮬레이션</div>
      <header className="screen__head">
        <div className="eyebrow">작전 결과 보고</div>
        <h1 className="screen__title">별빛 작전 — 결과 분석</h1>
        <p className="screen__subtitle">선택한 조건을 바탕으로 작전을 분석한 결과입니다.</p>
      </header>

      <div className="screen__body">
        {/* 선택 요약 */}
        <div className="card" style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[
            { label: "달의 위상", value: MOON_LABELS[draft.selectedMoon] || "—" },
            { label: "이동 시간", value: TIME_LABELS[draft.selectedTime] || "—" },
            { label: "이동 경로", value: ROUTE_LABELS[draft.selectedRoute] || "—" },
          ].map(item => (
            <div key={item.label} style={{ flex: "1 1 160px" }}>
              <div className="question__label" style={{ marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 700 }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-2">
          {/* 점수 */}
          <div className="stack">
            <ScoreRow
              label="노출 위험도"
              value={feedback.exposure_risk}
              tone={feedback.exposure_risk === "높음" ? "bad" : feedback.exposure_risk === "중간" ? "mid" : "good"}
              hint={feedback.exposure_risk === "높음" ? "노출 가능성 높음 — 재검토 필요" : feedback.exposure_risk === "중간" ? "주의 필요한 수준" : "비교적 안전한 작전"}
            />
            <ScoreRow
              label="이동 가능성"
              value={feedback.mobility}
              tone={feedback.mobility === "높음" ? "bad" : feedback.mobility === "중간" ? "mid" : "good"}
              hint={feedback.mobility === "높음" ? "험난한 행군 — 체력 소모 큼" : feedback.mobility === "중간" ? "보통 수준 이동 부담" : "비교적 수월한 경로"}
            />
            <ScoreRow
              label="방향 판단 가능성"
              value={feedback.navigation}
              tone={feedback.navigation === "높음" ? "good" : feedback.navigation === "중간" ? "mid" : "bad"}
              hint={feedback.navigation === "높음" ? "별·달 항법 안정적" : feedback.navigation === "중간" ? "보조 수단 필요" : "방향 상실 위험"}
            />
            <div className="result-total">
              <div className="result-total__label">종합 적절성</div>
              <div className="result-total__value">{feedback.overall}</div>
              <div className="result-total__note">
                {feedback.overall === "우수" ? "✦ 정교하고 균형 잡힌 작전입니다."
                  : feedback.overall === "보통" ? "● 현장 변수에 따라 조정이 필요합니다."
                  : feedback.overall === "미흡" ? "▲ 위험 요소가 큽니다. 재검토를 권장합니다."
                  : "—"}
              </div>
            </div>
          </div>

          {/* 피드백 + 성찰 */}
          <div className="stack">
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: 8 }}>
                {user ? 'AI 피드백' : '작전 분석'}
              </div>
              {user && saving && (
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                  ✦ AI 피드백 생성 중…
                </div>
              )}
              <div className="feedback-box">{feedback.feedback_text}</div>
            </div>
            <div className="reflection">
              <div className="eyebrow">선택 근거</div>
              <p style={{ margin: 0, lineHeight: "var(--leading-loose)" }}>{draft.reasonText}</p>
              <div className="divider" />
              <div className="eyebrow">보훈 성찰</div>
              <div className="reflection__quote">{draft.reflectionText}</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-banner">저장 오류: {error}</div>
        )}

        {/* 액션 */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", paddingTop: 8, alignItems: "center" }}>
          {user ? (
            <>
              {!saved && !saving && (
                <button className="btn btn--primary" onClick={handleManualSave}>
                  기록 저장하기
                </button>
              )}
              {saving && <span className="eyebrow" style={{ lineHeight: "42px" }}>저장 중…</span>}
              {saved && <span style={{ color: "var(--color-risk-low)", lineHeight: "42px", fontWeight: 600 }}>✓ 저장됨</span>}
              {saved && <Link to="/records" className="btn btn--ghost">나의 기록 보기</Link>}
            </>
          ) : (
            <div style={{ background: "rgba(232,207,122,0.06)", border: "1px solid var(--color-border-strong)", borderRadius: "var(--radius-md)", padding: "12px 20px", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              💾 기록을 저장하려면 <Link to="/" style={{ color: "var(--color-star-300)" }}>로그인</Link>이 필요합니다.
            </div>
          )}
          <Link to="/mission" className="btn btn--ghost">다시 도전하기</Link>
          <Link to="/" className="btn btn--ghost">홈으로</Link>
        </div>
      </div>
    </div>
  );
}
