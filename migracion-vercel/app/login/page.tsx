"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { isAdminSession, isProfessorSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const demoAccounts = {
  "admin@sistema.com": { id_usuario: 1, role: "Superadministrador", password: "admin123" },
  "profesor@sistema.com": { id_usuario: 2, role: "Profesor", password: "profesor123" },
};

const getRoleName = (idRol: number | null | undefined) =>
  idRol === 1 ? "Superadministrador" : "Profesor";

const ensureDemoUsers = async () => {
  if (!supabase) {
    const stored = localStorage.getItem("demo-usuarios");
    if (!stored) {
      const seed = [
        { id_usuario: 1, nombre: "Admin", apellido: "Sistema", email: "admin@sistema.com", password: "admin123", role: "Superadministrador" },
        { id_usuario: 2, nombre: "Profesor", apellido: "Demo", email: "profesor@sistema.com", password: "profesor123", role: "Profesor" },
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
    const { data: existing, error } = await supabase
      .from("usuarios")
      .select("id_usuario, password")
      .eq("email", account.email)
      .maybeSingle();

    if (error) {
      continue;
    }

    if (!existing) {
      await supabase.from("usuarios").insert(account);
      continue;
    }

    if (existing.password !== account.password) {
      await supabase.from("usuarios").update({ password: account.password }).eq("email", account.email);
    }
  }
};

const authenticateDemoUser = (normalizedEmail: string, password: string) => {
  const storedUsers = JSON.parse(localStorage.getItem("demo-usuarios") ?? "[]") as Array<Record<string, any>>;
  const account = demoAccounts[normalizedEmail as keyof typeof demoAccounts];
  const match = storedUsers.find((user) => user.email?.toLowerCase() === normalizedEmail) ?? account;

  if (!match || (match.password ?? "") !== password) {
    return null;
  }

  const matchRecord = match as Record<string, any>;
  const accountRecord = account as Record<string, any> | undefined;
  const fullName = `${matchRecord?.nombre ?? accountRecord?.nombre ?? "Profesor"} ${matchRecord?.apellido ?? accountRecord?.apellido ?? ""}`.trim();

  return {
    id_usuario: Number(matchRecord?.id_usuario ?? accountRecord?.id_usuario ?? 2),
    role: matchRecord?.role ?? accountRecord?.role ?? "Profesor",
    email: normalizedEmail,
    nombre: fullName,
  };
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
      try {
        const { data, error: dbError } = await supabase
          .from("usuarios")
          .select("id_usuario, nombre, apellido, email, password, id_rol")
          .eq("email", normalizedEmail)
          .maybeSingle();

        if (!dbError && data && data.password === password) {
          const role = getRoleName(data.id_rol);
          const nombreCompleto = `${data.nombre ?? ""} ${data.apellido ?? ""}`.trim();
          localStorage.setItem("session-role", role);
          localStorage.setItem("session-email", normalizedEmail);
          localStorage.setItem("session-user-id", String(data.id_usuario));
          localStorage.setItem("session-name", nombreCompleto || "Profesor");
          setError("");

          if (role === "Superadministrador") {
            router.push("/admin");
            return;
          }

          router.push("/dashboard");
          return;
        }
      } catch {
        // Si Supabase falla, dejamos caer al modo demo/local para que no bloquee siempre el login.
      }
    }

    const demoUser = authenticateDemoUser(normalizedEmail, password);
    if (!demoUser) {
      setError("Credenciales inválidas. Prueba admin@sistema.com / admin123 o profesor@sistema.com / profesor123.");
      return;
    }

    localStorage.setItem("session-role", demoUser.role);
    localStorage.setItem("session-email", demoUser.email);
    localStorage.setItem("session-user-id", String(demoUser.id_usuario));
    localStorage.setItem("session-name", demoUser.nombre || "Profesor");
    setError("");

    if (demoUser.role === "Superadministrador") {
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

          <div className="auth-links">
            <Link
              href="#"
              className="text-link"
              onClick={(event) => {
                event.preventDefault();
                setError("Recuperación de contraseña no habilitada en este momento. Habla con el administrador.");
              }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
            <Link href="/registro" className="text-link">
              ¿No tienes una cuenta? Regístrate
            </Link>
          </div>

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
