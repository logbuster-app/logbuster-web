/** Seta para a esquerda desenhada em SVG (traço único, herda a cor do texto). */
export function ArrowLeftIcon({ className = "size-4" }: { className?: string }) {
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
      <path d="M20 12H4M10 6l-6 6 6 6" />
    </svg>
  );
}
