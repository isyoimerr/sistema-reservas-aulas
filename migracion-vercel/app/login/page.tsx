"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { isAdminSession, isProfessorSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const demoAccounts = {
  "admin@sistema.com": { role: "Superadministrador", password: "admin123" },
  "profesor@sistema.com": { role: "Profesor", password: "profesor123" },
};

const getRoleName = (idRol: number | null | undefined) =>
  idRol === 1 ? "Superadministrador" : "Profesor";

const ensureDemoUsers = async () => {
  if (!supabase) {
    const stored = localStorage.getItem("demo-usuarios");
    if (!stored) {
      const seed = [
        { nombre: "Admin", apellido: "Sistema", email: "admin@sistema.com", password: "admin123", role: "Superadministrador" },
        { nombre: "Profesor", apellido: "Demo", email: "profesor@sistema.com", password: "profesor123", role: "Profesor" },
      ];
      localStorage.setItem("demo-usuarios", JSON.stringify(seed));
    }
    return;
  }

  const seedAccounts = [
    { nombre: "Admin", apellido: "Sistema", email: "admin@sistema.com", password: "admin123", id_rol: 1, estado: "Activo" },
    { nombre: "Profesor", apellido: "Demo", email: "profesor@sistema.com", password: "profesor123", id_rol: 2, estado: "Activo" },
  ];

  for (const account of seedAccounts) {
    const { data: existing } = await supabase
      .from("usuarios")
      .select("id_usuario, password")
      .eq("email", account.email)
      .maybeSingle();

    if (!existing) {
      await supabase.from("usuarios").insert(account);
      continue;
    }

    if (existing.password !== account.password) {
      await supabase.from("usuarios").update({ password: account.password }).eq("email", account.email);
    }
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@sistema.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await ensureDemoUsers();

    const normalizedEmail = email.trim().toLowerCase();

    if (isAdminSession() || isProfessorSession()) {
      const currentRole = localStorage.getItem("session-role");
      if (currentRole === "Superadministrador") {
        router.push("/admin");
        return;
      }
      router.push("/dashboard");
      return;
    }

    if (supabase) {
      const { data, error: dbError } = await supabase
        .from("usuarios")
        .select("id_usuario, nombre, apellido, email, password, id_rol")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (dbError) {
        setError("No se pudo validar la cuenta en Supabase.");
        return;
      }

      if (!data || data.password !== password) {
        setError("Credenciales inválidas. Prueba admin@sistema.com / admin123 o crea una cuenta nueva.");
        return;
      }

      const role = getRoleName(data.id_rol);
      localStorage.setItem("session-role", role);
      localStorage.setItem("session-email", normalizedEmail);
      localStorage.setItem("session-user-id", String(data.id_usuario));
      setError("");

      if (role === "Superadministrador") {
        router.push("/admin");
        return;
      }

      router.push("/dashboard");
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem("demo-usuarios") ?? "[]") as Array<Record<string, string>>;
    const registeredUser = storedUsers.find((user) => user.email.toLowerCase() === normalizedEmail);
    const account = demoAccounts[normalizedEmail as keyof typeof demoAccounts];
    const match = registeredUser ?? account;

    if (!match || (match.password ?? "") !== password) {
      setError("Credenciales inválidas. Prueba admin@sistema.com / admin123 o crea una cuenta nueva.");
      return;
    }

    localStorage.setItem("session-role", match.role ?? "Profesor");
    localStorage.setItem("session-email", normalizedEmail);
    setError("");

    if (match.role === "Superadministrador") {
      router.push("/admin");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="auth-copy">
          <p className="eyebrow">Acceso institucional</p>
          <h1>Reservas académicas</h1>
          <p>
            Sistema de gestión de aulas y reservas para docentes y personal administrativo.
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
