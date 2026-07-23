export function Logo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="yab-logo-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0284c7" />
          <stop offset="1" stopColor="#c026d3" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#yab-logo-gradient)" />
      <rect x="8" y="11" width="16" height="2.6" rx="1.3" fill="white" />
      <rect x="8" y="15.7" width="12" height="2.6" rx="1.3" fill="white" fillOpacity="0.9" />
      <rect x="8" y="20.4" width="8" height="2.6" rx="1.3" fill="white" fillOpacity="0.75" />
      <circle cx="24.5" cy="8.5" r="2.75" fill="white" />
    </svg>
  );
}
