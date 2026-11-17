import { createContext, useContext, useState } from "react";
import { loadJSON, saveJSON, loadText, saveText, makeId } from "../utils/storage";

// 앱 전체에서 같이 쓰는 상태: 로그인한 사용자, 등산 레벨, 산행 계획, 완등 인증 기록
// 지금은 서버 없이 브라우저(localStorage)에 저장합니다.
// 나중에 Firebase 같은 백엔드로 바꿀 때는 이 파일만 고치면 됩니다.

const USERS_KEY = "sanlok_users";
const SESSION_KEY = "sanlok_session";
const LEVEL_KEY = "userLevel"; // 로그인 전(게스트) 레벨 — 예전 버전과 같은 키
const DATA_KEY = "sanlok_data";

const EMPTY = { plans: [], completions: {} };

const AppContext = createContext(null);

// 비밀번호를 그대로 저장하지 않도록 해시로 바꿈 (데모용 — 진짜 보안은 서버가 필요)
async function hashPassword(password) {
  if (window.crypto?.subtle) {
    const bytes = new TextEncoder().encode("sanlok:" + password);
    const buf = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return btoa(unescape(encodeURIComponent("sanlok:" + password)));
}

export function AppProvider({ children }) {
  const [users, setUsers] = useState(() => loadJSON(USERS_KEY, []));
  const [sessionId, setSessionId] = useState(() => loadText(SESSION_KEY));
  const [guestLevel, setGuestLevel] = useState(() => loadText(LEVEL_KEY));
  const [allData, setAllData] = useState(() => loadJSON(DATA_KEY, {}));

  const user = users.find((u) => u.id === sessionId) || null;
  const level = (user ? user.level : guestLevel) || null;
  const data = (user && allData[user.id]) || EMPTY;

  // ---------- 계정 ----------
  function saveUsers(next) {
    setUsers(next);
    saveJSON(USERS_KEY, next);
  }

  function startSession(id) {
    setSessionId(id);
    saveText(SESSION_KEY, id);
  }

  async function signup({ email, nickname, password }) {
    const normalized = email.trim().toLowerCase();
    if (users.some((u) => u.email === normalized)) {
      return { ok: false, message: "이미 가입된 이메일이에요." };
    }
    const newUser = {
      id: makeId(),
      email: normalized,
      nickname: nickname.trim(),
      passwordHash: await hashPassword(password),
      level: guestLevel || null, // 가입 전에 고른 레벨을 이어받음
      createdAt: new Date().toISOString(),
    };
    saveUsers([...users, newUser]);
    startSession(newUser.id);
    return { ok: true, user: newUser };
  }

  async function login({ email, password }) {
    const normalized = email.trim().toLowerCase();
    const found = users.find((u) => u.email === normalized);
    if (!found || found.passwordHash !== (await hashPassword(password))) {
      return { ok: false, message: "이메일 또는 비밀번호가 맞지 않아요." };
    }
    startSession(found.id);
    return { ok: true, user: found };
  }

  function logout() {
    setSessionId(null);
    saveText(SESSION_KEY, null);
  }

  function updateProfile(changes) {
    if (!user) return;
    saveUsers(users.map((u) => (u.id === user.id ? { ...u, ...changes } : u)));
  }

  // ---------- 레벨 ----------
  function setLevel(newLevel) {
    if (user) updateProfile({ level: newLevel });
    setGuestLevel(newLevel);
    saveText(LEVEL_KEY, newLevel);
  }

  // ---------- 사용자 데이터 (계획, 인증) ----------
  // 저장에 실패하면(용량 초과) false를 돌려줘서 화면에서 알려줄 수 있게 함
  function updateData(updater) {
    if (!user) return false;
    const nextUserData = updater(data);
    const next = { ...allData, [user.id]: nextUserData };
    if (!saveJSON(DATA_KEY, next)) return false;
    setAllData(next);
    return true;
  }

  function savePlan(plan) {
    const now = new Date().toISOString();
    const withId = plan.id ? { ...plan, updatedAt: now } : { ...plan, id: makeId(), createdAt: now, updatedAt: now };
    const ok = updateData((d) => ({
      ...d,
      plans: plan.id ? d.plans.map((p) => (p.id === plan.id ? withId : p)) : [withId, ...d.plans],
    }));
    return ok ? withId : null;
  }

  function deletePlan(planId) {
    return updateData((d) => ({ ...d, plans: d.plans.filter((p) => p.id !== planId) }));
  }

  // completions: { [mountainId]: { date, photo, review, rating, createdAt } }
  function saveCompletion(mountainId, record) {
    return updateData((d) => ({
      ...d,
      completions: {
        ...d.completions,
        [mountainId]: { ...record, createdAt: d.completions[mountainId]?.createdAt || new Date().toISOString() },
      },
    }));
  }

  function removeCompletion(mountainId) {
    return updateData((d) => {
      const next = { ...d.completions };
      delete next[mountainId];
      return { ...d, completions: next };
    });
  }

  const value = {
    user,
    level,
    setLevel,
    signup,
    login,
    logout,
    updateProfile,
    plans: data.plans,
    completions: data.completions,
    savePlan,
    deletePlan,
    saveCompletion,
    removeCompletion,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  return useContext(AppContext);
}
