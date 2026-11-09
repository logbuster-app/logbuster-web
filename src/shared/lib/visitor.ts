export const VISITOR_STORAGE_KEY = "logbuster:visitor_id";

let clientMemoryFallbackId: string | null = null;

function generateUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback seguro caso crypto.randomUUID não esteja disponível
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Obtém ou inicializa o identificador anônimo do visitante (`X-Visitor-Id`).
 * Salva no localStorage sob a chave `logbuster:visitor_id`.
 * No SSR (`typeof window === "undefined"`), gera um ID único por invocação para evitar
 * vazamento de estado compartilhado em memória de processo Node.js entre diferentes usuários.
 */
export function getVisitorId(): string {
  if (typeof window === "undefined") {
    return generateUuid();
  }

  try {
    const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY);
    if (existing && existing.trim()) {
      return existing.trim();
    }

    const newId = generateUuid();
    window.localStorage.setItem(VISITOR_STORAGE_KEY, newId);
    return newId;
  } catch {
    // Caso o localStorage esteja desabilitado por configurações de privacidade no cliente
    if (!clientMemoryFallbackId) {
      clientMemoryFallbackId = generateUuid();
    }
    return clientMemoryFallbackId;
  }
}
