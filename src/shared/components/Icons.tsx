type IconProps = { className?: string };

function Svg({ className = "size-4", children }: IconProps & { children: React.ReactNode }) {
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
      {children}
    </svg>
  );
}

/** "+" desenhado: convite para votar. */
export function PlusIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 4v16M4 12h16" />
    </Svg>
  );
}

/** Marca de confirmação: voto já registrado. */
export function CheckIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 12.5 9.5 18 20 6.5" />
    </Svg>
  );
}

/** Polegar para cima: curtir. */
export function ThumbUpIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3.5 10.5h4v9.5h-4zM7.5 11l4-7.5c1.8 0 2.7 1.3 2.4 3L13.3 10h5.9a1.8 1.8 0 0 1 1.8 2.1l-1.2 6.4A2 2 0 0 1 17.8 20H7.5" />
    </Svg>
  );
}
