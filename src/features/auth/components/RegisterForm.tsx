"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useSession } from "@/shared/contexts/SessionContext";
import { loginAccount, registerAccount } from "../api/auth";
import { validateRegister } from "../validation";

function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useSession();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const result = validateRegister({ displayName, email, password });
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSubmitting(true);
    try {
      await registerAccount(result.input);
      const session = await loginAccount({ email: result.input.email, password: result.input.password });
      signIn(session);
      setPassword("");
      router.replace(safeNext(searchParams.get("next")));
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível criar sua conta. Tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-md border-2 border-foreground bg-surface">
      <header className="border-b-2 border-foreground px-5 py-4">
        <h1 className="font-display text-3xl text-foreground">Criar conta</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5 p-5">
        {error ? (
          <div role="alert" className="rounded-card border-2 border-danger bg-background p-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label htmlFor="register-name" className="block text-xs font-bold uppercase tracking-wide text-foreground">
            Nome de exibição <span className="text-danger">*</span>
          </label>
          <input
            id="register-name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            autoComplete="nickname"
            className="h-11 w-full rounded-card border-2 border-border bg-background px-3 text-sm text-foreground placeholder:text-subtle focus-visible:border-foreground"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="register-email" className="block text-xs font-bold uppercase tracking-wide text-foreground">
            E-mail <span className="text-danger">*</span>
          </label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            className="h-11 w-full rounded-card border-2 border-border bg-background px-3 text-sm text-foreground placeholder:text-subtle focus-visible:border-foreground"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="register-password" className="block text-xs font-bold uppercase tracking-wide text-foreground">
            Senha <span className="text-danger">*</span>
          </label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            className="h-11 w-full rounded-card border-2 border-border bg-background px-3 text-sm text-foreground placeholder:text-subtle focus-visible:border-foreground"
          />
          <p className="text-xs text-muted">Entre 8 e 128 caracteres.</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="min-h-11 w-full cursor-pointer rounded-card bg-primary px-5 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
        >
          {submitting ? "Criando conta..." : "Criar conta"}
        </button>

        <p className="text-sm text-muted">
          Já tem conta?{" "}
          <Link href={`/login${searchParams.get("next") ? `?next=${encodeURIComponent(searchParams.get("next") ?? "")}` : ""}`} className="font-bold text-primary-text underline">
            Entrar
          </Link>
        </p>
      </form>
    </section>
  );
}
