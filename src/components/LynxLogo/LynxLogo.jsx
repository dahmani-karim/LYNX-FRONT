export default function LynxLogo({ size = 32, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 200"
      width={size * 1.8}
      height={size}
      className={className}
      aria-label="LYNX"
    >
      <defs>
        <linearGradient id="logoEye" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5BA8D9" />
          <stop offset="100%" stopColor="#2B7BBF" />
        </linearGradient>
        <linearGradient id="logoIris" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6DBE45" />
          <stop offset="100%" stopColor="#3D8B2F" />
        </linearGradient>
      </defs>
      {/* Crosshair */}
      <circle cx="100" cy="100" r="58" fill="none" stroke="#2B7BBF" strokeWidth="0.8" opacity="0.2" />
      <line x1="100" y1="30" x2="100" y2="58" stroke="#2B7BBF" strokeWidth="1" opacity="0.25" />
      <line x1="100" y1="142" x2="100" y2="170" stroke="#2B7BBF" strokeWidth="1" opacity="0.25" />
      <line x1="30" y1="100" x2="58" y2="100" stroke="#2B7BBF" strokeWidth="1" opacity="0.25" />
      <line x1="142" y1="100" x2="170" y2="100" stroke="#2B7BBF" strokeWidth="1" opacity="0.25" />
      {/* Eye shape */}
      <path
        d="M30 100 Q65 55 100 55 Q135 55 170 100 Q135 140 100 140 Q65 140 30 100Z"
        fill="none" stroke="url(#logoEye)" strokeWidth="5" strokeLinejoin="round"
      />
      {/* Wing tips */}
      <path d="M30 100 Q36 78 52 66" fill="none" stroke="url(#logoEye)" strokeWidth="4" strokeLinecap="round" />
      <path d="M170 100 Q164 78 148 66" fill="none" stroke="url(#logoEye)" strokeWidth="4" strokeLinecap="round" />
      {/* Iris */}
      <ellipse cx="100" cy="100" rx="24" ry="28" fill="url(#logoIris)" />
      {/* Pupil */}
      <ellipse cx="100" cy="100" rx="10" ry="14" fill="#0A1005" />
      {/* Highlight */}
      <ellipse cx="94" cy="93" rx="5" ry="6" fill="white" opacity="0.7" />
      {/* LYNX text */}
      <text x="280" y="115" textAnchor="middle" fill="#F1F5F9" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="58" letterSpacing="6">
        LYNX
      </text>
    </svg>
  );
}
