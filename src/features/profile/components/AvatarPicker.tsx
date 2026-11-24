"use client";

import Image from "next/image";
import { CheckIcon } from "@/shared/components/Icons";
import { AVATAR_CATALOG, type AvatarId } from "../types";

export type AvatarPickerProps = {
  value: AvatarId | null;
  availableIds?: readonly AvatarId[];
  disabled?: boolean;
  onChange: (next: AvatarId | null) => void;
};

/**
 * Seletor acessível das 8 ilustrações de avatar em SVG (SPEC-FRONT-09 §4.7, SPEC-UI-01 RN-05).
 * Estado selecionado comunicado por preenchimento osso + ícone de confirmação, não só por cor.
 */
export function AvatarPicker({
  value,
  availableIds,
  disabled = false,
  onChange,
}: AvatarPickerProps) {
  const items = availableIds
    ? AVATAR_CATALOG.filter((item) => availableIds.includes(item.id))
    : AVATAR_CATALOG;

  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <legend className="text-xs font-bold uppercase tracking-wide text-foreground">
          Avatar do catálogo
        </legend>
        {value !== null ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(null)}
            className="min-h-11 cursor-pointer px-2 text-xs font-bold uppercase tracking-wide text-primary-text underline underline-offset-4 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Usar inicial do nome
          </button>
        ) : (
          <span className="text-xs text-muted">Sem ilustração: exibe a inicial</span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {items.map((item) => {
          const selected = value === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onChange(selected ? null : item.id)}
              className={`group relative flex flex-col items-center overflow-hidden rounded-card border-2 p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted hover:border-foreground hover:text-foreground"
              }`}
            >
              <span className="relative aspect-square w-full overflow-hidden rounded-card border border-border bg-surface-raised">
                <Image
                  src={item.src}
                  alt=""
                  fill
                  unoptimized
                  sizes="64px"
                  className="object-cover"
                />
              </span>
              <span className="mt-1 flex min-h-5 items-center gap-1 text-[11px] font-bold uppercase">
                {selected ? <CheckIcon className="size-3" /> : null}
                <span>{item.id.replace("avatar-0", "#")}</span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
