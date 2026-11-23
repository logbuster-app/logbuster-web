import type { LoginInput, RegisterInput } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthValidationResult<T> =
  | { ok: true; input: T }
  | { ok: false; error: string };

export function validateRegister(values: RegisterInput): AuthValidationResult<RegisterInput> {
  const displayName = values.displayName.trim();
  const email = values.email.trim();

  if (displayName.length < 2 || displayName.length > 50) {
    return { ok: false, error: "O nome de exibição deve ter entre 2 e 50 caracteres." };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Informe um e-mail válido." };
  }
  if (values.password.length < 8 || values.password.length > 128) {
    return { ok: false, error: "A senha deve ter entre 8 e 128 caracteres." };
  }

  return { ok: true, input: { displayName, email, password: values.password } };
}

export function validateLogin(values: LoginInput): AuthValidationResult<LoginInput> {
  const email = values.email.trim();
  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Informe um e-mail válido." };
  }
  if (!values.password) {
    return { ok: false, error: "Informe sua senha." };
  }

  return { ok: true, input: { email, password: values.password } };
}
