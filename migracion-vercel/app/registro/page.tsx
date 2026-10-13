"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getSupabaseStatus, supabase } from "@/lib/supabase";

type FormData = {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
};

const emptyForm: FormData = {
  nombre: "",
  apellido: "",
  email: "",
  password: "",
};

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const supabaseStatus = getSupabaseStatus();

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.nombre || !form.apellido || !form.email || !form.password) {
      setError("Completa todos los campos para continuar.");
      setSuccess("");
      return;
    }

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setSuccess("");
      return;
    }

    const normalizedEmail = form.email.trim().toLowerCase();

    if (supabase) {
      try {
        const { data: existingUser, error: lookupError } = await supabase
          .from("usuarios")
          .select("id_usuario")
          .eq("email", normalizedEmail)
          .maybeSingle();

        if (lookupError) {
          throw lookupError;
        }

        if (existingUser) {
          setError("Ya existe un usuario registrado con ese correo.");
          setSuccess("");
          return;
        }

        const { error: insertError } = await supabase.from("usuarios").insert({
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          email: normalizedEmail,
          password: form.password,
          id_rol: 2,
          estado: "Activo",
        });

        if (insertError) {
          throw insertError;
        }

        setError("");
        setSuccess("Registro exitoso. Ya puedes iniciar sesión.");
        setForm(emptyForm);
        setTimeout(() => router.push("/login"), 800);
        return;
      } catch {
        const existing = JSON.parse(localStorage.getItem("demo-usuarios") ?? "[]") as Array<Record<string, string>>;
        const alreadyExists = existing.some((user) => user.email === normalizedEmail);

        if (alreadyExists) {
          setError("Ya existe un usuario registrado con ese correo.");
          setSuccess("");
          return;
        }

        const users = [
          ...existing,
          {
            nombre: form.nombre.trim(),
            apellido: form.apellido.trim(),
            email: normalizedEmail,
            password: form.password,
            role: "Profesor",
          },
        ];

        localStorage.setItem("demo-usuarios", JSON.stringify(users));
        setError("");
        setSuccess("Supabase no respondió correctamente; se registró en modo respaldo local. Puedes iniciar sesión normalmente.");
        setForm(emptyForm);

        setTimeout(() => router.push("/login"), 900);
        return;
      }
    }

    const existing = JSON.parse(localStorage.getItem("demo-usuarios") ?? "[]") as Array<Record<string, string>>;
    const alreadyExists = existing.some((user) => user.email === normalizedEmail);

    if (alreadyExists) {
      setError("Ya existe un usuario registrado con ese correo.");
      setSuccess("");
      return;
    }

    const users = [
      ...existing,
      {
        nombre: form.nombre,
        apellido: form.apellido,
        email: normalizedEmail,
        password: form.password,
        role: "Profesor",
      },
    ];

    localStorage.setItem("demo-usuarios", JSON.stringify(users));
    setError("");
    setSuccess("Registro exitoso. Ya puedes iniciar sesión.");
    setForm(emptyForm);

    setTimeout(() => router.push("/login"), 800);
  };

  return (
    <main className="register-shell">
      <section className="register-panel">
        <div className="auth-copy">
          <p className="eyebrow">Nueva cuenta</p>
          <h1>Registra a un docente</h1>
          <p>
            Completa la información para crear una cuenta institucional y guardarla en la base real cuando Supabase esté configurado.
          </p>
        </div>

        {!supabaseStatus.enabled ? (
          <div className="demo-banner" role="status" aria-live="polite">
            {supabaseStatus.message}
          </div>
        ) : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Registro</h2>

          <label>
            Nombre
            <input
              type="text"
              value={form.nombre}
              onChange={(event) => handleChange("nombre", event.target.value)}
              placeholder="Ej: Ana"
            />
          </label>

          <label>
            Apellido
            <input
              type="text"
              value={form.apellido}
              onChange={(event) => handleChange("apellido", event.target.value)}
              placeholder="Ej: Gómez"
            />
          </label>

          <label>
            Correo institucional
            <input
              type="email"
              value={form.email}
              onChange={(event) => handleChange("email", event.target.value)}
              placeholder="nombre@institucion.edu"
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={form.password}
              onChange={(event) => handleChange("password", event.target.value)}
              placeholder="••••••••"
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}

          <button type="submit">Crear cuenta</button>

          <Link href="/login" className="text-link">
            Ya tengo cuenta
          </Link>
        </form>
      </section>
    </main>
  );
}
