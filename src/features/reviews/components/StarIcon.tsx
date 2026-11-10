const STAR_POINTS =
  "12 2.5 14.9 8.7 21.6 9.5 16.6 14.1 18 20.8 12 17.4 6 20.8 7.4 14.1 2.4 9.5 9.1 8.7";

/** Estrela de cinco pontas desenhada em SVG; herda a cor do texto. */
export function StarIcon({
  filled = false,
  className = "size-4",
}: {
  filled?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="miter"
    >
      <polygon points={STAR_POINTS} />
    </svg>
  );
}
