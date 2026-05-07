import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginButton from "./LoginButton";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // 패널 바깥 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <div className="header">
      <Link to="/" className="header__brand">
        별빛 작전 · 보훈교육
      </Link>

      {/* 프로필 버튼 */}
      <div className="header__profile" ref={panelRef}>
        <button
          className="header__profile-btn"
          onClick={() => setOpen(v => !v)}
          aria-label="사용자 메뉴"
        >
          {user?.picture ? (
            <img src={user.picture} alt={user.name} className="header__avatar" />
          ) : (
            <span className="header__profile-icon">
              {/* 사람 아이콘 */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </span>
          )}
        </button>

        {/* 드롭다운 패널 */}
        {open && (
          <div className="header__panel">
            {user ? (
              <>
                {/* 유저 정보 */}
                <div className="header__panel-user">
                  {user.picture && (
                    <img src={user.picture} alt={user.name} className="header__panel-avatar" />
                  )}
                  <div>
                    <div className="header__panel-name">{user.name || "사용자"}</div>
                    <div className="header__panel-email">{user.email}</div>
                  </div>
                </div>

                <div className="header__panel-divider" />

                {/* 메뉴 */}
                <Link
                  to="/records"
                  className="header__panel-item"
                  onClick={() => setOpen(false)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
                  </svg>
                  나의 기록
                </Link>

                <Link
                  to="/mission"
                  className="header__panel-item"
                  onClick={() => setOpen(false)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  새 미션 시작
                </Link>

                <div className="header__panel-divider" />

                <button className="header__panel-item header__panel-logout" onClick={handleLogout}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <div className="header__panel-login-title">로그인</div>
                <div className="header__panel-login-desc">
                  로그인하면 미션 기록을 저장하고<br />AI 개인화 피드백을 받을 수 있습니다.
                </div>
                <div className="header__panel-login-btn">
                  <LoginButton onSuccess={() => setOpen(false)} />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
