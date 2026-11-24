"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CloseIcon } from "@/shared/components/CloseIcon";
import { useModalBehavior } from "@/shared/hooks/useModalBehavior";
import { fetchAvatars, updateProfile } from "../api/profile";
import { AVATAR_IDS, type AvatarId, type PublicProfile } from "../types";
import { PROFILE_LIMITS, validateProfilePatch } from "../validation";
import { AvatarPicker } from "./AvatarPicker";
import { ImageField } from "./ImageField";

export type ProfileEditModalProps = {
  profile: PublicProfile;
  onClose: () => void;
  onProfileRefresh: () => void | Promise<void>;
  onSaved: (updated: PublicProfile) => void | Promise<void>;
};

/**
 * Modal de edição do perfil pelo titular (SPEC-FRONT-09 RN-08..RN-11, SPEC-UI-01 §6.1).
 * Fecha por Escape, "Cancelar" ou "×", nunca por clique fora.
 */
export function ProfileEditModal({
  profile,
  onClose,
  onProfileRefresh,
  onSaved,
}: ProfileEditModalProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarId, setAvatarId] = useState<AvatarId | null>(profile.avatarId);
  const [availableAvatars, setAvailableAvatars] = useState<readonly AvatarId[]>(AVATAR_IDS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useModalBehavior(dialogRef, { onClose, canClose: !submitting });

  useEffect(() => {
    const controller = new AbortController();
    fetchAvatars(controller.signal)
      .then((ids) => {
        if (ids.length > 0) setAvailableAvatars(ids);
      })
      .catch(() => {
        // Fallback silencioso para os 8 IDs padrão do catálogo
      });
    return () => controller.abort();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validation = validateProfilePatch({ bio, avatarId });
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    setSubmitting(true);
    try {
      const updated = await updateProfile(validation.input);
      await onSaved(updated);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar as alterações do perfil.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/90 p-3 sm:p-6">
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-edit-modal-title"
        className="my-auto w-full max-w-xl rounded-card border-2 border-foreground bg-surface"
      >
        <header className="flex items-center justify-between gap-4 border-b-2 border-foreground px-5 py-3">
          <h2
            id="profile-edit-modal-title"
            className="font-display text-3xl text-foreground"
          >
            Editar perfil
          </h2>
          <button
            type="button"
            aria-label="Fechar edição de perfil"
            disabled={submitting}
            onClick={onClose}
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-card text-foreground hover:bg-surface-raised hover:text-primary-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CloseIcon />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {error ? (
            <div
              role="alert"
              className="rounded-card border-2 border-danger bg-background p-3 text-sm text-danger"
            >
              {error}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <ImageField
              kind="avatar"
              currentUrl={profile.avatarImageUrl}
              disabled={submitting}
              onChanged={onProfileRefresh}
            />
            <ImageField
              kind="background"
              currentUrl={profile.backgroundImageUrl}
              disabled={submitting}
              onChanged={onProfileRefresh}
            />
          </div>

          <AvatarPicker
            value={avatarId}
            availableIds={availableAvatars}
            disabled={submitting}
            onChange={setAvatarId}
          />

          <div className="space-y-1.5">
            <label
              htmlFor="profile-bio"
              className="block text-xs font-bold uppercase tracking-wide text-foreground"
            >
              Bio
            </label>
            <textarea
              id="profile-bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              maxLength={PROFILE_LIMITS.bioMaxLength}
              rows={3}
              placeholder="Conte em poucas linhas que tipo de cinema move você."
              className="font-reading w-full resize-y rounded-card border-2 border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-subtle focus-visible:border-foreground"
            />
            <p className="text-right text-xs text-muted" aria-live="polite">
              {bio.trim().length} / {PROFILE_LIMITS.bioMaxLength}
            </p>
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t-2 border-border pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="min-h-11 cursor-pointer rounded-card border-2 border-border px-5 text-sm font-bold uppercase tracking-wide text-muted hover:border-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-11 cursor-pointer rounded-card bg-primary px-5 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? "Salvando..." : "Salvar alterações"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
