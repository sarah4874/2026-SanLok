import { Link } from "react-router-dom";
import { getMountain } from "../data/mountains";
import { formatDate, toDateString } from "../utils/time";

export default function PlanList({ plans, currentId, onDelete }) {
  const today = toDateString();
  return (
    <ul className="plan-list">
      {plans.map((p) => {
        const m = getMountain(p.mountainId);
        const isPast = p.date < today;
        return (
          <li key={p.id} className={`plan-item ${p.id === currentId ? "current" : ""} ${isPast ? "past" : ""}`}>
            <Link to={`/planner?plan=${p.id}`} className="plan-link">
              <strong>{m?.name}</strong>
              <span>
                {formatDate(p.date)} · {p.startTime} 출발 · 일정 {p.steps.length}개
              </span>
            </Link>
            {isPast && <span className="plan-tag">지난 계획</span>}
            <button className="icon-button" onClick={() => onDelete(p.id)} aria-label="계획 삭제">
              🗑
            </button>
          </li>
        );
      })}
    </ul>
  );
}
