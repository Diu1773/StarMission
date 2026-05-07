export const MOON_OPTIONS = [
  {
    id: "full",
    label: "보름달",
    icon: "full",
    risk: "high",
    pros: ["지형·지물이 잘 보임", "근거리 식별 용이"],
    cons: ["연락원 모습 노출", "그림자까지 드러남", "검문 위험 매우 높음"],
  },
  {
    id: "half",
    label: "상현달",
    icon: "half",
    risk: "mid",
    pros: ["적당한 가시성 확보", "기본 지형 인지 가능"],
    cons: ["중간 정도의 노출 위험", "월몰 시점 계산 필요"],
  },
  {
    id: "new",
    label: "그믐달",
    icon: "new",
    risk: "low",
    pros: ["은신 가능성 매우 높음", "별빛 항법에 유리"],
    cons: ["발 디딤이 어려움", "근거리 식별 곤란"],
  },
];

export const TIME_OPTIONS = [
  {
    id: "afterTwilight",
    label: "박명 종료 후",
    time: "19:40 ~ 20:30",
    risk: "high",
    desc: "황혼이 남아 실루엣이 뚜렷이 드러납니다. 노출 위험이 가장 높습니다.",
  },
  {
    id: "beforeMoonrise",
    label: "월출 전",
    time: "20:30 ~ 21:50",
    risk: "low",
    desc: "달이 아직 뜨지 않아 가장 어두운 시간대. 은신에 유리합니다.",
  },
  {
    id: "moonHigh",
    label: "달이 높이 뜬 시간",
    time: "21:50 ~ 00:00",
    risk: "mid",
    desc: "달이 높이 올라 가시성이 회복됩니다. 주의가 필요합니다.",
  },
  {
    id: "dawn",
    label: "새벽",
    time: "03:30 ~ 05:00",
    risk: "low",
    desc: "달이 진 뒤 깊은 어둠. 새벽 박명 전까지 이동에 유리합니다.",
  },
];

export const ROUTE_OPTIONS = [
  {
    id: "routeA",
    label: "A 경로",
    name: "마을·도로 통과",
    length: "7km",
    time: "약 2시간",
    exposure: "high",
    difficulty: "low",
    hide: "low",
    desc: "가장 빠른 경로. 마을과 도로를 통과하므로 노출과 검문 위험이 높습니다.",
  },
  {
    id: "routeB",
    label: "B 경로",
    name: "산지·숲 우회",
    length: "12km",
    time: "약 4시간",
    exposure: "low",
    difficulty: "high",
    hide: "high",
    desc: "산지와 숲을 우회하여 은신에 유리합니다. 이동 난이도가 높습니다.",
  },
  {
    id: "routeC",
    label: "C 경로",
    name: "하천 주변 이동",
    length: "9km",
    time: "약 3시간",
    exposure: "mid",
    difficulty: "mid",
    hide: "mid",
    desc: "하천을 따라 방향 파악이 쉽습니다. 달빛에 강물이 반사되면 노출 가능합니다.",
  },
];

export const MOON_LABELS = { full: "보름달", half: "상현달", new: "그믐달" };
export const TIME_LABELS = {
  afterTwilight: "박명 종료 후",
  beforeMoonrise: "월출 전",
  moonHigh: "달이 높이 뜬 시간",
  dawn: "새벽",
};
export const ROUTE_LABELS = {
  routeA: "A 경로 (마을·도로)",
  routeB: "B 경로 (산지·숲)",
  routeC: "C 경로 (하천 주변)",
};
