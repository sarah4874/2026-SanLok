import { Link } from "react-router-dom";
import LevelBadge from "./LevelBadge";

export default function MountainCard({ mountain, completed }) {
  return (
    <Link to={`/mountains/${mountain.id}`} className={`mountain-card ${completed ? "completed" : ""}`}>
      <div className="card-top">
        <LevelBadge level={mountain.level} />
        <span className="card-height">
          <span className={`series-tag ${mountain.series === "100+" ? "plus" : ""}`}>{mountain.seriesLabel}</span>
          {mountain.elevation}
        </span>
      </div>
      <h3>
        {mountain.name}
        {completed && (
          <span className="done-mark" title="완등">
            ✓ 완등
          </span>
        )}
      </h3>
      <p className="card-location">{mountain.location}</p>
      {mountain.desc && <p className="card-desc">{mountain.desc}</p>}
    </Link>
  );
}
