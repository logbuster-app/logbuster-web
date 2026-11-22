"use client";

import { useCallback, useState } from "react";
import { checkSpoiler } from "../api/reviewAi";
import type { SpoilerCheckStatus } from "../types";

/** Sugestão de spoiler ao publicar. `check` nunca lança: falha = "unavailable". */
export function useSpoilerCheck() {
  const [checking, setChecking] = useState(false);

  const check = useCallback(async (movieId: string, content: string): Promise<SpoilerCheckStatus> => {
    setChecking(true);
    try {
      return await checkSpoiler(movieId, content);
    } finally {
      setChecking(false);
    }
  }, []);

  return { check, checking };
}
