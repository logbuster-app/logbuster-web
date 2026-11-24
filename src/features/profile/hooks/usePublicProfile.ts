"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchProfile } from "../api/profile";
import type { PublicProfile } from "../types";

export type PublicProfileStatus = "loading" | "success" | "not_found" | "error";

type ProfileQueryResult = {
  userId: string;
  version: number;
  profile: PublicProfile | null;
  notFound: boolean;
  error: string | null;
};

export function usePublicProfile(
  userId: string,
  initialProfile?: PublicProfile | null,
) {
  const trimmedId = userId.trim();

  const [result, setResult] = useState<ProfileQueryResult | null>(() => {
    if (initialProfile && trimmedId && initialProfile.userId === trimmedId) {
      return {
        userId: trimmedId,
        version: 0,
        profile: initialProfile,
        notFound: false,
        error: null,
      };
    }
    return null;
  });
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  const setProfileData = useCallback(
    (nextProfile: PublicProfile) => {
      setResult({
        userId: trimmedId,
        version,
        profile: nextProfile,
        notFound: false,
        error: null,
      });
    },
    [trimmedId, version],
  );

  useEffect(() => {
    if (!trimmedId) return;

    if (initialProfile && version === 0 && initialProfile.userId === trimmedId) {
      return;
    }

    const controller = new AbortController();

    fetchProfile(trimmedId, controller.signal)
      .then((data) => {
        setResult({
          userId: trimmedId,
          version,
          profile: data,
          notFound: data === null,
          error: null,
        });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setResult({
          userId: trimmedId,
          version,
          profile: null,
          notFound: false,
          error:
            err instanceof Error
              ? err.message
              : "Não foi possível carregar o perfil.",
        });
      });

    return () => {
      controller.abort();
    };
  }, [trimmedId, version, initialProfile]);

  const current =
    result && result.userId === trimmedId && result.version === version
      ? result
      : null;

  let status: PublicProfileStatus = "loading";
  if (!trimmedId) {
    status = "not_found";
  } else if (!current) {
    status = "loading";
  } else if (current.notFound) {
    status = "not_found";
  } else if (current.error) {
    status = "error";
  } else {
    status = "success";
  }

  const matchingPrevious =
    result && result.userId === trimmedId ? result.profile : null;

  return {
    profile: current?.profile ?? matchingPrevious ?? null,
    status,
    error: current?.error ?? null,
    reload,
    setProfileData,
  };
}
