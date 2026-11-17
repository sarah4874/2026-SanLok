import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { LEVELS, LEVEL_KEYS } from "../data/mountains";

const MENUS = [
  { to: "/home", label: "홈" },
  { to: "/mountains", label: "명산 찾기" },
  { to: "/planner", label: "산행 플래너" },
  { to: "/mypage", label: "마이페이지" },
];

// 바깥을 누르면 닫히는 드롭다운용 훅
function useOutsideClose(isOpen, close) {
  const ref = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) close();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, close]);
  return ref;
}

export default function Navbar() {
  const { level, setLevel, user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null); // "level" | "user" | null
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const closeAll = () => setOpenMenu(null);
  const levelRef = useOutsideClose(openMenu === "level", closeAll);
  const userRef = useOutsideClose(openMenu === "user", closeAll);

  // 페이지를 옮기면 열려 있던 메뉴 닫기
  useEffect(() => {
    setOpenMenu(null);
    setIsMobileOpen(false);
  }, [location.pathname]);

  // 첫 온보딩 화면에서는 상단바 숨김
  if (location.pathname === "/") return null;

  const toggle = (name) => setOpenMenu(openMenu === name ? null : name);

  const changeLevel = (newLevel) => {
    setLevel(newLevel);
    setOpenMenu(null);
  };

  const handleAccount = () => {
    if (user) toggle("user");
    else navigate("/login", { state: { from: location.pathname + location.search } });
  };

  const handleLogout = () => {
    logout();
    setOpenMenu(null);
    navigate("/home");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/home" className="logo">
          산록<span className="logo-hanja">山麓</span>
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="메뉴 열기"
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? "✕" : "☰"}
        </button>

        <nav className={`nav-menu ${isMobileOpen ? "open" : ""}`}>
          {MENUS.map((menu) => (
            <NavLink key={menu.to} to={menu.to} className="nav-link">
              {menu.label}
            </NavLink>
          ))}

          <div className="nav-actions">
            {/* 동그란 로그인 버튼: 로그인 전엔 로그인 화면으로, 로그인 후엔 계정 메뉴 */}
            <div className="account" ref={userRef}>
              <button
                className={`account-button ${user ? "signed-in" : ""}`}
                onClick={handleAccount}
                aria-label={user ? `${user.nickname} 계정 메뉴` : "로그인"}
                title={user ? user.nickname : "로그인"}
              >
                {user ? user.nickname.slice(0, 1) : <PersonIcon />}
              </button>
              <span className="account-label">{user ? user.nickname : "로그인"}</span>
              {openMenu === "user" && user && (
                <div className="dropdown account-dropdown">
                  <div className="dropdown-head">
                    <strong>{user.nickname}</strong>
                    <small>{user.email}</small>
                  </div>
                  <Link to="/mypage" className="dropdown-item">
                    마이페이지
                  </Link>
                  <button className="dropdown-item" onClick={handleLogout}>
                    로그아웃
                  </button>
                </div>
              )}
            </div>

            <div className="level-select" ref={levelRef}>
              <button className="level-button" onClick={() => toggle("level")}>
                {level ? `${LEVELS[level].emoji} ${LEVELS[level].label}` : "레벨 선택"} ▾
              </button>
              {openMenu === "level" && (
                <div className="dropdown level-dropdown">
                  {LEVEL_KEYS.map((lvl) => (
                    <button
                      key={lvl}
                      className={`level-option ${level === lvl ? "active" : ""}`}
                      onClick={() => changeLevel(lvl)}
                    >
                      <strong>
                        {LEVELS[lvl].emoji} {LEVELS[lvl].full}
                      </strong>
                      <small>{LEVELS[lvl].desc}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="8.5" r="4" fill="currentColor" />
      <path d="M4 20.5c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="currentColor" />
    </svg>
  );
}
