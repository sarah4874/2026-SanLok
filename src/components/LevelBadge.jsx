import { LEVELS } from "../data/mountains";

const CLASS = { 초급: "easy", 중급: "medium", 고급: "hard" };

export default function LevelBadge({ level }) {
  return (
    <span className={`level-badge ${CLASS[level]}`}>
      {LEVELS[level].emoji} {LEVELS[level].label}
    </span>
  );
}
