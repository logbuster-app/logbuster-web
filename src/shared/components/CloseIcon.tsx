/** "X" desenhado em SVG (traço único, herda a cor do texto). */
export function CloseIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="square"
      aria-hidden="true"
      className={className}
    >
      <path d="M5 5l14 14M19 5 5 19" />
    </svg>
  );
}
