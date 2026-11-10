/** Triângulo de aviso desenhado em SVG (traço único, herda a cor do texto). */
export function WarningIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 10v5M12 17.5v.5" />
    </svg>
  );
}
