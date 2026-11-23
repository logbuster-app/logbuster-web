"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  clearSession,
  getSessionSnapshot,
  saveSession,
  subscribeSession,
  type SessionViewer,
  type StoredSession,
} from "../lib/session";

export type SignInSession = {
  accessToken: string;
  expiresIn: number;
  viewer: SessionViewer;
};

export type SessionContextValue = {
  viewer: SessionViewer | null;
  signIn: (session: SignInSession) => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    () => null,
  );
  const session = snapshot ? (JSON.parse(snapshot) as StoredSession) : null;

  useEffect(() => {
    if (!session) return;
    const remaining = session.expiresAt - Date.now();
    if (remaining <= 0) {
      clearSession();
      return;
    }

    const timeoutId = window.setTimeout(clearSession, remaining);
    return () => window.clearTimeout(timeoutId);
  }, [session]);

  const signIn = useCallback((nextSession: SignInSession) => {
    saveSession({
      accessToken: nextSession.accessToken,
      expiresAt: Date.now() + nextSession.expiresIn * 1000,
      viewer: nextSession.viewer,
    });
  }, []);

  const signOut = useCallback(() => {
    clearSession();
  }, []);

  const value = useMemo(
    () => ({ viewer: session?.viewer ?? null, signIn, signOut }),
    [session, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  return context ?? {
    viewer: null,
    signIn: () => undefined,
    signOut: () => undefined,
  };
}
