interface SealProps {
  size?: number;
  className?: string;
}

export default function Seal({ size = 36, className = "" }: SealProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="People Connect MLA seal"
    >
      <circle cx="32" cy="32" r="30" fill="#1B2740" />
      <circle cx="32" cy="32" r="24" fill="none" stroke="#D9A02A" strokeWidth="1.6" strokeDasharray="2 3" />
      <circle cx="32" cy="32" r="19" fill="none" stroke="#F6F1E4" strokeWidth="1" opacity="0.5" />
      <circle cx="32" cy="32" r="7.5" fill="#A63A2C" />
      <g stroke="#F6F1E4" strokeWidth="2" strokeLinecap="round">
        <line x1="32" y1="6" x2="32" y2="13" />
        <line x1="32" y1="51" x2="32" y2="58" />
        <line x1="6" y1="32" x2="13" y2="32" />
        <line x1="51" y1="32" x2="58" y2="32" />
      </g>
    </svg>
  );
}
