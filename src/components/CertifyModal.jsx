import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { toDateString, formatFullDate } from "../utils/time";

// 완등 인증 창: 오른 날짜를 기록합니다.
export default function CertifyModal({ mountain, onClose }) {
  const { completions, saveCompletion, removeCompletion } = useApp();
  const existing = completions[mountain.id];

  const [date, setDate] = useState(existing?.date || toDateString());
  const [error, setError] = useState("");

  // ESC로 닫기
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (date > toDateString()) {
      setError("미래 날짜로는 인증할 수 없어요.");
      return;
    }
    if (!saveCompletion(mountain.id, { date })) {
      setError("저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.");
      return;
    }
    onClose();
  };

  const handleRemove = () => {
    removeCompletion(mountain.id);
    onClose();
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>⛳ {mountain.name} 완등 인증</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <p className="muted">
          {existing
            ? `${formatFullDate(existing.date)}에 완등했어요. 날짜를 고치거나 기록을 지울 수 있어요.`
            : `${mountain.elevation} 정상에 올랐다면 날짜를 기록하세요. 마이페이지 완등 기록에 남아요.`}
        </p>

        <label className="field">
          <span>오른 날짜</span>
          <input type="date" value={date} max={toDateString()} onChange={(e) => setDate(e.target.value)} required />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          {existing && (
            <button type="button" className="btn btn-danger-ghost" onClick={handleRemove}>
              기록 삭제
            </button>
          )}
          <button type="submit" className="btn btn-primary">
            {existing ? "수정하기" : "인증하기"}
          </button>
        </div>
      </form>
    </div>
  );
}
