// localStorage는 시크릿 모드나 용량 초과 시 에러가 날 수 있어서 항상 try/catch로 감쌉니다.

export function loadJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false; // 대부분 용량 초과(사진이 너무 많을 때)
  }
}

export function loadText(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveText(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // 저장 실패해도 화면은 계속 동작
  }
}

export function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
