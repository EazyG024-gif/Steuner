interface LogoMarkProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 32, className = '' }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="steuner-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="steuner-bg-dark" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>

      {/* Background rounded square */}
      <rect width="32" height="32" rx="9" fill="url(#steuner-bg)" />

      {/* Mark: stylized upward-curving S = growth + support */}
      {/* Top arc — curves right to left */}
      <path
        d="M 22 9 C 22 9 14 9 11 12 C 9 14 10 17 14 18"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />
      {/* Bottom arc — curves left to right */}
      <path
        d="M 10 18 C 10 18 18 18 21 21 C 23 23 22 26 18 26"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />
      {/* Small dot at top-right to balance */}
      <circle cx="22" cy="9" r="1.5" fill="white" opacity="0.9" />
      {/* Small dot at bottom-left to balance */}
      <circle cx="18" cy="26" r="1.5" fill="white" opacity="0.9" />
    </svg>
  );
}

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 32, showText = true, className = '' }: LogoProps) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {showText && (
        <span
          className="font-bold text-foreground tracking-tight"
          style={{ fontSize: size * 0.55, lineHeight: 1 }}
        >
          Steuner
        </span>
      )}
    </span>
  );
}
