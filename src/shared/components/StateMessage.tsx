type Props = {
  title: string;
  description?: string;
  tone?: "neutral" | "danger";
};

export function StateMessage({ title, description, tone = "neutral" }: Props) {
  const border = tone === "danger" ? "border-danger" : "border-border";
  const titleColor = tone === "danger" ? "text-danger" : "text-foreground";
  return (
    <div
      role={tone === "danger" ? "alert" : undefined}
      className={`rounded-card border-2 ${border} bg-surface p-6 text-center`}
    >
      <p className={`font-display text-2xl ${titleColor}`}>{title}</p>
      {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
    </div>
  );
}
