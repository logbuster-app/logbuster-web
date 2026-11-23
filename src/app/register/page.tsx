import { Suspense } from "react";
import { RegisterForm } from "@/features/auth";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-muted">Carregando...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
