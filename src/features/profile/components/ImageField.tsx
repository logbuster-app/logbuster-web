"use client";

import { useId, useRef, useState, type ChangeEvent } from "react";
import { deleteProfileImage, uploadProfileImage } from "../api/profile";
import type { ProfileImageKind } from "../types";
import { validateProfileImage } from "../validation";

export type ImageFieldProps = {
  kind: ProfileImageKind;
  currentUrl: string | null;
  disabled?: boolean;
  onChanged: () => void | Promise<void>;
};

const LABELS: Record<
  ProfileImageKind,
  {
    title: string;
    activeStatus: string;
    emptyStatus: string;
    uploadButton: string;
    replaceButton: string;
    removeButton: string;
  }
> = {
  avatar: {
    title: "Foto de perfil",
    activeStatus: "Foto personalizada ativa (sobrepõe o avatar do catálogo).",
    emptyStatus: "Sem foto enviada: o perfil usa o avatar escolhido ou a inicial.",
    uploadButton: "Enviar foto",
    replaceButton: "Trocar foto",
    removeButton: "Remover foto",
  },
  background: {
    title: "Imagem de fundo",
    activeStatus: "Fundo personalizado ativo no topo do perfil.",
    emptyStatus: "Sem imagem enviada: o perfil usa a faixa padrão.",
    uploadButton: "Enviar fundo",
    replaceButton: "Trocar fundo",
    removeButton: "Remover fundo",
  },
};

export function ImageField({
  kind,
  currentUrl,
  disabled = false,
  onChanged,
}: ImageFieldProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busyAction, setBusyAction] = useState<"upload" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const copy = LABELS[kind];
  const isBusy = disabled || busyAction !== null;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validation = validateProfileImage(file);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    setError(null);
    setBusyAction("upload");
    try {
      await uploadProfileImage(kind, file);
      await onChanged();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível enviar a imagem.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function handleRemove() {
    setError(null);
    setBusyAction("remove");
    try {
      await deleteProfileImage(kind);
      await onChanged();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível remover a imagem.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="space-y-2 rounded-card border-2 border-border bg-background p-3">
      <div className="space-y-1">
        <label
          htmlFor={inputId}
          className="block text-xs font-bold uppercase tracking-wide text-foreground"
        >
          {copy.title}
        </label>
        <p className="text-xs text-muted">
          {currentUrl ? copy.activeStatus : copy.emptyStatus} JPEG, PNG ou WebP até 8 MiB.
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-card border-2 border-danger bg-surface p-2.5 text-xs text-danger"
        >
          {error}
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={isBusy}
        onChange={handleFileChange}
        className="sr-only"
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={isBusy}
          onClick={() => fileInputRef.current?.click()}
          className="min-h-11 cursor-pointer rounded-card border-2 border-foreground px-4 text-xs font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busyAction === "upload"
            ? "Enviando..."
            : currentUrl
              ? copy.replaceButton
              : copy.uploadButton}
        </button>

        {currentUrl ? (
          <button
            type="button"
            disabled={isBusy}
            onClick={handleRemove}
            className="min-h-11 cursor-pointer rounded-card border-2 border-border px-4 text-xs font-bold uppercase tracking-wide text-muted transition-colors hover:border-danger hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busyAction === "remove" ? "Removendo..." : copy.removeButton}
          </button>
        ) : null}
      </div>
    </div>
  );
}
