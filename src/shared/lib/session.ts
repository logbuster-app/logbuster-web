export type SessionViewer = {
  userId: string;
  displayName: string;
};

export type StoredSession = {
  accessToken: string;
  expiresAt: number;
  viewer: SessionViewer;
};

export const SESSION_STORAGE_KEY = "logbuster:session";
export const SESSION_CHANGED_EVENT = "logbuster:session-changed";

let memorySession: StoredSession | null = null;

function dispatchSessionChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

export function readSession(): StoredSession | null {
  if (typeof window === "undefined") return memorySession;

  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return memorySession && memorySession.expiresAt > Date.now()
        ? memorySession
        : null;
    }

    const session = JSON.parse(raw) as Partial<StoredSession>;
    if (
      typeof session.accessToken !== "string" ||
      typeof session.expiresAt !== "number" ||
      typeof session.viewer?.userId !== "string" ||
      typeof session.viewer?.displayName !== "string"
    ) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    if (session.expiresAt <= Date.now()) {
      memorySession = null;
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      dispatchSessionChanged();
      return null;
    }

    return session as StoredSession;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return readSession()?.accessToken ?? null;
}

export function saveSession(session: StoredSession): void {
  memorySession = session;
  if (typeof window === "undefined") {
    dispatchSessionChanged();
    return;
  }

  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Sessões em memória são mantidas pelo provider quando o storage falha.
  }
  dispatchSessionChanged();
}

export function clearSession(): void {
  memorySession = null;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // A sessão em memória ainda pode ser descartada pelo evento.
    }
  }
  dispatchSessionChanged();
}

export function getSessionSnapshot(): string | null {
  const session = readSession();
  return session
    ? JSON.stringify({ accessToken: session.accessToken, expiresAt: session.expiresAt, viewer: session.viewer })
    : null;
}

export function subscribeSession(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  window.addEventListener(SESSION_CHANGED_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(SESSION_CHANGED_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
