"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const demoAccounts = {
  "admin@sistema.com": { role: "Superadministrador", password: "admin123" },
  "profesor@sistema.com": { role: "Profesor", password: "profesor123" },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@sistema.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const account = demoAccounts[email as keyof typeof demoAccounts];

    if (!account || account.password !== password) {
      setError("Credenciales inválidas. Prueba admin@sistema.com / admin123");
      return;
    }

    localStorage.setItem("session-role", account.role);
    localStorage.setItem("session-email", email);
    setError("");

    if (account.role === "Superadministrador") {
      router.push("/admin");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="auth-copy">
          <p className="eyebrow">Migración segura</p>
          <h1>Acceso al sistema</h1>
          <p>
            Esta versión de prueba refleja la lógica de autenticación del sistema
            original y está lista para conectarse a Supabase cuando se añadan las
            credenciales reales.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Iniciar sesión</h2>
          <label>
            Correo institucional
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="correo@institucion.edu"
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit">Entrar</button>

          <div className="demo-accounts">
            <strong>Cuentas de prueba</strong>
            <span>admin@sistema.com / admin123</span>
            <span>profesor@sistema.com / profesor123</span>
          </div>

          <Link href="/" className="text-link">
            Volver al inicio
          </Link>
        </form>
      </section>
    </main>
  );
}
