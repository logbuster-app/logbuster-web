"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useSession } from "@/shared/contexts/SessionContext";
import { loginAccount } from "../api/auth";
import { validateLogin } from "../validation";

function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const result = validateLogin({ email, password });
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSubmitting(true);
    try {
      const session = await loginAccount(result.input);
      signIn(session);
      router.replace(safeNext(searchParams.get("next")));
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível entrar. Tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-md border-2 border-foreground bg-surface">
      <header className="border-b-2 border-foreground px-5 py-4">
        <h1 className="font-display text-3xl text-foreground">Entrar</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5 p-5">
        {error ? (
          <div role="alert" className="rounded-card border-2 border-danger bg-background p-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wide text-foreground">
            E-mail <span className="text-danger">*</span>
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            className="h-11 w-full rounded-card border-2 border-border bg-background px-3 text-sm text-foreground placeholder:text-subtle focus-visible:border-foreground"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wide text-foreground">
            Senha <span className="text-danger">*</span>
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="h-11 w-full rounded-card border-2 border-border bg-background px-3 text-sm text-foreground placeholder:text-subtle focus-visible:border-foreground"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="min-h-11 w-full cursor-pointer rounded-card bg-primary px-5 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
        >
          {submitting ? "Entrando..." : "Entrar"}
        </button>

        <p className="text-sm text-muted">
          Ainda não tem conta?{" "}
          <Link href={`/register${searchParams.get("next") ? `?next=${encodeURIComponent(searchParams.get("next") ?? "")}` : ""}`} className="font-bold text-primary-text underline">
            Criar conta
          </Link>
        </p>
      </form>
    </section>
  );
}
