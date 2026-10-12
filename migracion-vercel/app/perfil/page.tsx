"use client";

import RoleSidebar from "@/components/role-sidebar";
import { useEffect, useState } from "react";

export default function PerfilPage() {
  const [role, setRole] = useState("Profesor");
  const [email, setEmail] = useState("profesor@sistema.com");
  const [nombre, setNombre] = useState("Usuario del sistema");
  const [telefono, setTelefono] = useState("+56 9 1234 5678");
  const [guardado, setGuardado] = useState("");

  useEffect(() => {
    const storedRole = localStorage.getItem("session-role") ?? "Profesor";
    const storedEmail = localStorage.getItem("session-email") ?? "profesor@sistema.com";
    setRole(storedRole);
    setEmail(storedEmail);
    setNombre(storedEmail.split("@")[0] || "Usuario del sistema");
  }, []);

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGuardado("Perfil actualizado correctamente.");
  };

  return (
    <main className="page-shell">
      <RoleSidebar />

      <section className="content-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Cuenta</p>
            <h1>Configuración de perfil</h1>
          </div>
          <div className="user-pill">
            <span>{role}</span>
            <small>{email}</small>
          </div>
        </header>

        <div className="dashboard-layout">
          <article className="info-card dashboard-section">
            <div className="section-header">
              <h3>Datos personales</h3>
              <span>Perfil</span>
            </div>

            <form className="form-card" onSubmit={handleSave}>
              <div className="form-grid">
                <label>
                  Nombre completo
                  <input value={nombre} onChange={(event) => setNombre(event.target.value)} />
                </label>

                <label>
                  Correo institucional
                  <input value={email} onChange={(event) => setEmail(event.target.value)} />
                </label>

                <label>
                  Teléfono
                  <input value={telefono} onChange={(event) => setTelefono(event.target.value)} />
                </label>

                <label>
                  Rol
                  <input value={role} readOnly />
                </label>
              </div>

              {guardado ? <p className="form-feedback">{guardado}</p> : null}

              <div className="form-actions">
                <button type="submit" className="primary-button">Guardar cambios</button>
                <button type="button" className="secondary-button">Cancelar</button>
              </div>
            </form>
          </article>

          <article className="info-card dashboard-section activity-card">
            <div className="section-header">
              <h3>Seguridad</h3>
              <span>Cuenta</span>
            </div>
            <ul className="list">
              <li>Último inicio de sesión: hoy a las 08:20.</li>
              <li>Autenticación activa y protegida.</li>
              <li>Preferencias de acceso sincronizadas.</li>
              <li>Permisos actualizados según el rol asignado.</li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
