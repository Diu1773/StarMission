# 별빛 작전 — 에듀테크 보훈교육 웹앱

달빛과 밤하늘 조건을 분석해 독립운동 비밀 연락 미션을 설계하는 카드형 탐구 활동 프로토타입입니다.  
예비교사가 생성형 AI와 바이브코딩으로 맞춤형 보훈교육 도구를 직접 제작할 수 있다는 아이디어를 보여줍니다.

---

## 빠른 시작

### 1. 백엔드 실행

```bash
cd backend

# 가상환경 생성 및 활성화
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

# 의존성 설치
pip install -r requirements.txt

# 환경변수 파일 생성
cp .env.example .env
# .env를 열어 GOOGLE_CLIENT_ID와 JWT_SECRET_KEY를 입력하세요

# 서버 실행
uvicorn main:app --reload --port 8000
```

### 2. 프론트엔드 실행

```bash
cd frontend

# 환경변수 파일 생성
cp .env.example .env
# .env를 열어 VITE_GOOGLE_CLIENT_ID를 입력하세요

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

---

## 환경변수 설정

### frontend/.env

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=구글_OAuth_Client_ID
```

### backend/.env

```env
GOOGLE_CLIENT_ID=구글_OAuth_Client_ID
JWT_SECRET_KEY=랜덤_문자열_32자_이상
FRONTEND_ORIGIN=http://localhost:5173
DATABASE_URL=sqlite:///./app.db
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
```

---

## Google OAuth 설정 방법

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **API 및 서비스 → 사용자 인증 정보** 메뉴로 이동
4. **사용자 인증 정보 만들기 → OAuth 클라이언트 ID** 선택
5. 애플리케이션 유형: **웹 애플리케이션** 선택
6. **승인된 JavaScript 원본** 추가:
   - 개발: `http://localhost:5173`
   - 배포 후: `https://your-frontend-domain.com`
7. **승인된 리디렉션 URI** 추가:
   - 개발: `http://localhost:5173`
8. 생성된 **클라이언트 ID**를 frontend와 backend의 `.env`에 모두 입력

> ⚠️ OAuth 동의 화면에서 테스트 사용자를 추가하거나 앱을 공개 상태로 전환해야 다른 Google 계정으로 로그인할 수 있습니다.

---

## 주요 API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/health` | 서버 상태 확인 |
| POST | `/api/auth/google` | Google 로그인 (credential 검증 후 쿠키 발급) |
| GET | `/api/auth/me` | 현재 로그인 사용자 정보 |
| POST | `/api/auth/logout` | 로그아웃 (쿠키 삭제) |
| POST | `/api/records` | 미션 기록 저장 (자동 점수화) |
| GET | `/api/records` | 나의 기록 목록 |
| GET | `/api/records/{id}` | 기록 상세 (다른 사용자 접근 403) |

### POST /api/records 요청 예시

```json
{
  "selectedMoon": "new",
  "selectedTime": "beforeMoonrise",
  "selectedRoute": "routeB",
  "reasonText": "그믐달로 노출을 최소화하고 월출 전에 산지·숲 경로로 이동...",
  "reflectionText": "독립운동가들의 지혜와 생존 의지를 느꼈습니다..."
}
```

### 점수화 기준

| 항목 | 내용 |
|------|------|
| **노출 위험도** | 달 밝기 + 시간대 + 경로 노출도 종합 |
| **이동 가능성** | 경로 난이도 + 시간대 이동 조건 |
| **방향 판단** | 달 밝기(별 시야) + 경로 특성 + 시간대 |
| **종합 적절성** | 안전도 45% + 이동 가능성 25% + 방향 판단 30% |

---

## 배포 구상 (Render + GitHub 연동)

### 프론트엔드 — Render Static Site

1. GitHub에 저장소 push
2. Render → New → Static Site
3. Build command: `npm run build`
4. Output directory: `dist`
5. Root directory: `frontend`
6. 환경변수: `VITE_API_BASE_URL`, `VITE_GOOGLE_CLIENT_ID` 설정

### 백엔드 — Render Web Service

1. Render → New → Web Service
2. Root directory: `backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. 환경변수: `GOOGLE_CLIENT_ID`, `JWT_SECRET_KEY`, `FRONTEND_ORIGIN`, `COOKIE_SECURE=true`, `COOKIE_SAMESITE=none` 설정

### SQLite 주의사항

> ⚠️ Render 무료 플랜의 Web Service는 파일 시스템이 재배포 시 초기화됩니다.  
> - **과제용 프로토타입**: SQLite로 충분합니다.  
> - **실제 운영**: Render Persistent Disk 추가($) 또는 PostgreSQL(무료 90일)로 전환을 권장합니다.  
>   PostgreSQL 전환 시 `DATABASE_URL`을 postgres 연결 문자열로 변경하고, `psycopg2-binary`를 requirements에 추가하세요.

### HTTPS 배포 시 쿠키 설정 변경

```env
# backend/.env (배포)
COOKIE_SECURE=true
COOKIE_SAMESITE=none
FRONTEND_ORIGIN=https://your-frontend.onrender.com
```

```env
# frontend/.env (배포)
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=구글_OAuth_Client_ID
```

---

## 앞으로 개선 가능한 점

- **이미지 자산**: `public/assets/`에 실제 역사 자료 이미지 추가 (공공누리 자료 활용)
- **실시간 천문 데이터**: NASA Horizons API 또는 PyEphem으로 실제 월출·월몰 시각 연동
- **교사 대시보드**: 학급 전체 기록 열람, 선택 분포 통계
- **인쇄/PDF 출력**: 작전 계획서 + 성찰문 한 장 출력 기능
- **다크모드 외 테마**: 교사가 커스터마이징 가능한 강조색 설정
- **PostgreSQL 전환**: 영구 데이터 저장을 위한 DB 마이그레이션
