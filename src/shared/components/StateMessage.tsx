type Props = {
  title: string;
  description?: string;
  tone?: "neutral" | "danger";
};

export function StateMessage({ title, description, tone = "neutral" }: Props) {
  const border = tone === "danger" ? "border-danger/50" : "border-border";
  return (
    <div
      role={tone === "danger" ? "alert" : undefined}
      className={`rounded-card border ${border} bg-surface p-6 text-center`}
    >
      <p className="font-semibold">{title}</p>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
    </div>
  );
}
