import logging
from openai import OpenAI

logger = logging.getLogger(__name__)

MOON_LABELS = {"full": "보름달", "half": "상현달", "new": "그믐달"}
TIME_LABELS = {
    "afterTwilight": "박명 종료 직후",
    "beforeMoonrise": "월출 전",
    "moonHigh": "달이 높이 뜬 시간",
    "dawn": "새벽",
}
ROUTE_LABELS = {
    "routeA": "A 경로 (마을·도로)",
    "routeB": "B 경로 (산지·숲)",
    "routeC": "C 경로 (하천 주변)",
}


def calculate_score(
    selected_moon: str, selected_time: str, selected_route: str,
    reason_text: str = "", reflection_text: str = "",
) -> dict:
    # 노출 위험도 (높을수록 위험, 0-100)
    moon_exposure = {"full": 90, "half": 50, "new": 20}
    time_exposure = {"afterTwilight": 85, "beforeMoonrise": 15, "moonHigh": 55, "dawn": 25}
    route_exposure = {"routeA": 75, "routeB": 20, "routeC": 50}

    exposure_score = (
        moon_exposure.get(selected_moon, 50)
        + time_exposure.get(selected_time, 50)
        + route_exposure.get(selected_route, 50)
    ) / 3
    exposure_score = min(100, round(exposure_score))

    # 이동 가능성 (높을수록 이동 난이도가 높음, 0-100)
    route_mobility = {"routeA": 65, "routeB": 85, "routeC": 30}
    time_mobility = {"afterTwilight": 30, "beforeMoonrise": 65, "moonHigh": 45, "dawn": 70}

    mobility_score = (
        route_mobility.get(selected_route, 50)
        + time_mobility.get(selected_time, 50)
    ) / 2
    mobility_score = min(100, round(mobility_score))

    # 방향 판단 가능성 (높을수록 좋음, 0-100)
    moon_nav = {"full": 30, "half": 55, "new": 80}
    route_nav = {"routeA": 40, "routeB": 45, "routeC": 75}
    time_nav = {"afterTwilight": 45, "beforeMoonrise": 85, "moonHigh": 50, "dawn": 60}

    nav_score = (
        moon_nav.get(selected_moon, 50)
        + route_nav.get(selected_route, 50)
        + time_nav.get(selected_time, 50)
    ) / 3
    nav_score = min(100, round(nav_score))

    # 종합 적절성
    safety = 100 - exposure_score
    overall_score = round(safety * 0.45 + (100 - mobility_score) * 0.25 + nav_score * 0.30)

    def level_bad(score: int) -> str:
        if score >= 70:
            return "높음"
        elif score >= 40:
            return "중간"
        return "낮음"

    def level_good(score: int) -> str:
        if score >= 65:
            return "높음"
        elif score >= 40:
            return "중간"
        return "낮음"

    def overall_level(score: int) -> str:
        if score >= 72:
            return "우수"
        elif score >= 52:
            return "보통"
        return "미흡"

    fallback = _generate_feedback(
        selected_moon, selected_time, selected_route,
        exposure_score, mobility_score, nav_score, overall_score
    )
    feedback = _groq_feedback(
        selected_moon, selected_time, selected_route,
        reason_text, reflection_text,
        exposure_score, mobility_score, nav_score, overall_score,
        fallback,
    )

    return {
        "exposure_risk": level_bad(exposure_score),
        "mobility": level_bad(mobility_score),
        "navigation": level_good(nav_score),
        "overall": overall_level(overall_score),
        "feedback_text": feedback,
        "scores": {
            "exposure": exposure_score,
            "mobility": mobility_score,
            "navigation": nav_score,
            "overall": overall_score,
        },
    }


def _generate_feedback(moon, time, route, exposure, mobility, nav, overall) -> str:
    moon_label = MOON_LABELS.get(moon, moon)
    time_label = TIME_LABELS.get(time, time)
    route_label = ROUTE_LABELS.get(route, route)

    parts = []

    # 달 조건 평가
    if moon == "new":
        parts.append(
            f"{moon_label}을 선택하여 달빛 노출을 최소화했습니다. "
            "은신에 매우 유리하지만 이동 중 발 디딤과 방향 판단에 주의가 필요합니다."
        )
    elif moon == "half":
        parts.append(
            f"{moon_label}은 적당한 가시성을 제공합니다. "
            "월몰 시점을 함께 계산해 노출 위험을 줄이는 것이 중요합니다."
        )
    else:
        parts.append(
            f"{moon_label}은 밝은 달빛으로 노출 위험이 매우 높습니다. "
            "완전한 은신이 어려운 조건입니다."
        )

    # 시간대 평가
    if time == "beforeMoonrise":
        parts.append(
            f"이동 시간으로 '{time_label}'을 선택한 것은 탁월한 판단입니다. "
            "가장 어두운 시간대로 은신에 가장 유리합니다."
        )
    elif time == "afterTwilight":
        parts.append(
            f"'{time_label}'은 아직 황혼이 남아 실루엣이 드러날 수 있습니다. "
            "노출 위험이 높은 시간대입니다."
        )
    elif time == "moonHigh":
        parts.append(
            f"'{time_label}'은 달이 높이 떠 가시성이 좋지만, 그만큼 노출 위험도 높습니다."
        )
    else:
        parts.append(
            f"'{time_label}'은 박명이 시작되기 전 어둠을 활용할 수 있지만, "
            "시간이 길어지면 새벽빛이 노출을 높일 수 있습니다."
        )

    # 경로 평가
    if route == "routeB":
        parts.append(
            f"{route_label}은 산지와 숲을 우회해 은신에 유리합니다. "
            "다만 야간 산행의 이동 난이도가 높아 체력 관리가 필요합니다."
        )
    elif route == "routeA":
        parts.append(
            f"{route_label}은 마을과 도로를 통과하므로 노출 위험이 높습니다. "
            "빠른 이동이 가능하지만 감시와 검문 위험을 감수해야 합니다."
        )
    else:
        parts.append(
            f"{route_label}은 하천을 따라 방향을 파악하기 쉽습니다. "
            "달빛 아래 강물이 반사되면 노출될 수 있으므로 주의가 필요합니다."
        )

    # 종합 평가
    if overall >= 72:
        parts.append(
            f"종합 적절성 {overall}점으로 정교하고 균형 잡힌 작전입니다. "
            "달빛 조건·시간대·경로 선택이 유기적으로 잘 연결되었습니다."
        )
    elif overall >= 52:
        parts.append(
            f"종합 적절성 {overall}점으로 현장 변수에 따라 조정이 필요한 수준입니다. "
            "노출 위험 또는 이동 난이도 중 하나를 개선하면 더 나은 작전이 됩니다."
        )
    else:
        parts.append(
            f"종합 적절성 {overall}점으로 위험 요소가 큰 작전입니다. "
            "달 조건, 이동 시간, 경로 중 하나 이상을 재검토해 보세요."
        )

    return " ".join(parts)


def _groq_feedback(
    moon: str, time: str, route: str,
    reason_text: str, reflection_text: str,
    exposure: int, mobility: int, nav: int, overall: int,
    fallback: str,
) -> str:
    """Groq(Llama 3)로 교육적 피드백 생성. 실패 시 fallback 반환."""
    from app.config import settings
    if not settings.GROQ_API_KEY:
        return fallback

    moon_label   = MOON_LABELS.get(moon, moon)
    time_label   = TIME_LABELS.get(time, time)
    route_label  = ROUTE_LABELS.get(route, route)

    prompt = f"""당신은 한국 독립운동 역사 교육 AI 튜터입니다.
학생이 1919년 경성(서울)에서 비밀 문서를 밤에 전달하는 작전을 시뮬레이션했습니다.

[학생 선택]
- 달의 위상: {moon_label}
- 이동 시간대: {time_label}
- 이동 경로: {route_label}

[분석 점수 (0-100, 높을수록 위험/좋음)]
- 노출 위험도: {exposure}점
- 이동 난이도: {mobility}점
- 방향 판단 가능성: {nav}점
- 종합 적절성: {overall}점

[학생이 작성한 선택 근거]
{reason_text or '(미작성)'}

[학생의 보훈 성찰]
{reflection_text or '(미작성)'}

위 정보를 바탕으로 학생에게 3~4문장의 교육적 피드백을 한국어로 작성하세요.
- 선택의 장단점을 구체적으로 언급할 것
- 실제 독립운동가들의 상황과 연결할 것
- 학생의 선택 근거를 반영하여 개인화할 것
- 격려하는 톤으로 마무리할 것
- JSON, 마크다운, 따옴표 없이 순수 텍스트만 출력"""

    try:
        client = OpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1",
        )
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=400,
            temperature=0.7,
        )
        text = resp.choices[0].message.content.strip()
        return text if text else fallback
    except Exception as e:
        logger.warning("Groq 피드백 생성 실패: %s", e)
        return fallback
