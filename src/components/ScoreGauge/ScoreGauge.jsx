import { getScoreColor, getScoreLabel } from '../../services/riskEngine';
import './ScoreGauge.scss';

export default function ScoreGauge({ score, size = 120, strokeWidth = 8, label, showLabel = true }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score, 100) / 100;
  const dashOffset = circumference * (1 - progress);
  const color = getScoreColor(score);
  const scoreLabel = label || getScoreLabel(score);

  return (
    <div className="score-gauge">
      <div className="score-gauge__svg-wrap" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="score-gauge__svg">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="score-gauge__bg"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="score-gauge__progress score-gauge-animated"
          />
        </svg>
        <div className="score-gauge__value">
          <span className="score-gauge__number" style={{ color }}>
            {Math.round(score)}
          </span>
          {showLabel && <span className="score-gauge__max">/100</span>}
        </div>
      </div>
      {showLabel && (
        <span className="score-gauge__label" style={{ color }}>
          {scoreLabel}
        </span>
      )}
    </div>
  );
}
