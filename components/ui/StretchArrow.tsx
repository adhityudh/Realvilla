export default function StretchArrow({ className = '' }: { className?: string }) {
  return (
    <svg className={`stretch-arrow ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <g className="arrow-shaft"><line x1="2" y1="12" x2="20" y2="12" /></g>
      <polyline className="arrow-head" points="18 8 22 12 18 16" />
    </svg>
  );
}
