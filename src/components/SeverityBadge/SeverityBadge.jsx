import { SEVERITY_LEVELS } from '../../config/categories';
import './SeverityBadge.scss';

export default function SeverityBadge({ severity, size = 'sm' }) {
  const config = SEVERITY_LEVELS[severity] || SEVERITY_LEVELS.info;

  return (
    <span
      className={`severity-badge severity-badge--${size}`}
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
}
