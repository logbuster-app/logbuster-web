"use client";

import { type RefObject, useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Options = {
  onClose: () => void;
  /** Quando `false`, `Escape` não fecha (ex.: durante o envio). */
  canClose?: boolean;
};

/**
 * Comportamento padrão de modal acessível:
 * `Escape` fecha, o foco fica preso dentro do diálogo, volta ao elemento que o
 * abriu ao fechar e a página de fundo não rola enquanto ele está aberto.
 */
export function useModalBehavior(
  dialogRef: RefObject<HTMLElement | null>,
  { onClose, canClose = true }: Options,
) {
  // Refs evitam reinstalar os listeners (e perder o foco) a cada render.
  const onCloseRef = useRef(onClose);
  const canCloseRef = useRef(canClose);
  useEffect(() => {
    onCloseRef.current = onClose;
    canCloseRef.current = canClose;
  });

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (canCloseRef.current) onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [dialogRef]);
}
