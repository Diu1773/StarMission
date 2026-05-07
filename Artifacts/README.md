# 별빛 작전 — 에듀테크 보훈교육 웹앱

> 달빛과 밤하늘로 설계하는 독립운동 비밀 연락 미션

---

## 📌 프로젝트 소개

**별빛 작전**은 중·고등학생 및 예비교사를 대상으로 한 에듀테크 기반 보훈교육 웹앱입니다.  
학생들이 독립운동 비밀 연락원이 되어 달빛·월출·월몰·북극성·이동 경로를 분석하고  
가장 적절한 작전 계획을 세우는 **7단계 카드형 탐구 플랫폼**입니다.

> ⚠️ **중요**: 이 앱에서 사용되는 일지·사료·시나리오는  
> 실제 역사적 맥락을 바탕으로 **교육 목적으로 창작된 허구의 자료**입니다.  
> 특정 실존 인물이나 사건을 지칭하지 않습니다.

---

## 🖥️ 화면 구성

| 단계 | 화면 | 내용 |
|------|------|------|
| STEP 01 | 역사 자료 분석 | 역사적 맥락 자료와 가상 시나리오를 분리하여 제시, 단서 선택 |
| STEP 02 | 달의 위상 | 보름달·상현달·그믐달 비교, 노출 위험도 선택 |
| STEP 03 | 시간대 분석 | 일몰·박명·월출·월몰 타임라인, 이동 시간대 선택 |
| STEP 04 | 북극성 항법 | 실제 별자리 데이터 기반 천구도, 방향 판단 가능성 선택 |
| STEP 05 | 경로 선택 | 강변·능선·관도 비교 지도, 노출도·난이도·은신 가능성 |
| STEP 06 | 작전 계획서 | 선택 요약 + 근거 서술 |
| STEP 07 | 결과 + 성찰 | 4지표 점수 + 보훈 성찰 질문 + 성찰 노트 입력 |

---

## 🏫 수업 활용 방법

### 대상 및 차시
- **대상**: 중학교 3학년 ~ 고등학교 2학년 / 예비교사 수업 설계 과제
- **차시**: 1차시 (45분) 또는 2차시 (90분)

### 1차시 진행 예시 (45분)
| 시간 | 활동 |
|------|------|
| 0–5분 | 인트로: 배경 설명 및 미션 안내 |
| 5–20분 | STEP 01–03: 자료 분석·달 위상·시간대 탐구 |
| 20–35분 | STEP 04–06: 항법·경로 선택·계획서 작성 |
| 35–45분 | STEP 07: 결과 확인 및 성찰 노트 공유 |

### 2차시 진행 예시 (90분)
| 시간 | 활동 |
|------|------|
| 0–10분 | 독립운동 역사 배경 강의 |
| 10–50분 | 개인 탐구: STEP 01–07 완료 |
| 50–70분 | 모둠 토의: 서로 다른 작전 계획 비교 |
| 70–90분 | 전체 공유: 성찰 노트 Padlet 게시 및 토론 |

### Padlet 연동
- 결과 화면의 **"결과 공유 (클립보드)"** 버튼을 눌러 결과 텍스트를 복사
- 교사가 개설한 Padlet에 붙여넣기하여 학급 결과 공유
- Padlet URL은 교사가 직접 `index.html`의 `handleShare` 함수에 삽입 가능

### 이미지 자료 교체 방법
- `public/assets/history-doc.jpg` 위치에 실제 사료 이미지를 넣으면 자동 적용됩니다.
- 이미지가 없을 경우 striped placeholder가 자동으로 표시됩니다.
- **권장 이미지 출처**: 국가보훈부 공공누리, 독립기념관 디지털 아카이브

---

## 🚀 배포 방법

### 로컬 실행 (Vite로 마이그레이션 후)
```bash
npm install
npm run dev       # 개발 서버 (http://localhost:5173)
npm run build     # 프로덕션 빌드 → dist/ 폴더
npm run preview   # 빌드 결과 미리보기
```

### 현재 HTML 단독 실행
```bash
# 별도 서버 없이 index.html을 브라우저에서 바로 열기
open index.html

# 또는 Python 간이 서버
python3 -m http.server 3000
# → http://localhost:3000
```

### GitHub Pages 배포
```bash
# dist/ 폴더를 gh-pages 브랜치에 배포
npm install -D gh-pages
npx gh-pages -d dist
```

### Vercel / Netlify 배포
- Vercel: `vercel` CLI 또는 GitHub 연동 → 루트 디렉토리 선택
- Netlify: `netlify deploy --dir=dist --prod`
- 빌드 커맨드: `npm run build` / 퍼블리시 디렉토리: `dist`

---

## 🎨 디자인 시스템

CSS 토큰은 `tokens.css`에 정의되어 있습니다.  
Claude Code로 개발 시 `tokens.css`를 import하여 재사용하세요.

```css
@import "./tokens.css";

/* 주요 토큰 예시 */
var(--color-night-900)   /* 가장 깊은 밤 배경 */
var(--color-star-300)    /* 별빛 금색 강조 */
var(--font-display)      /* Noto Serif KR */
var(--font-body)         /* Pretendard */
var(--radius-xl)         /* 24px 둥근 카드 */
var(--shadow-card)       /* 카드 그림자 */
```

---

## 📁 파일 구조

```
별빛 작전/
├── index.html          # 메인 앱 (React + Babel)
├── screens.jsx         # 7개 화면 컴포넌트
├── styles.css          # 컴포넌트 스타일
├── tokens.css          # 디자인 토큰 (공용 CSS 변수)
├── tweaks-panel.jsx    # 교사용 Tweaks 패널
├── README.md           # 본 파일
└── assets/
    └── history-doc.jpg # (선택) 역사 자료 이미지
```

---

## ⚙️ 기술 스택

- **React 18.3** (CDN, Babel standalone)
- **CSS Custom Properties** (디자인 토큰)
- **SVG** (별자리 천구도, 경로 지도, 달 위상)
- Vite 마이그레이션 준비 완료 구조

---

## 📜 라이선스 및 주의사항

- 본 앱의 시나리오·일지는 교육 목적의 **창작물**입니다.
- 역사 사료 이미지 사용 시 **공공누리 이용 조건**을 확인하세요.
- 국가보훈부 공공누리 자료: https://www.mpva.go.kr
- 독립기념관 디지털 아카이브: https://www.independence.or.kr
