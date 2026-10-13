"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const adminMenu = [
  { label: "Home", href: "/admin" },
  { label: "Dashboard", href: "/admin" },
  { label: "Reservas", href: "/reservas" },
  { label: "Aulas", href: "/aulas" },
  { label: "Usuarios", href: "/usuarios" },
  { label: "Horarios", href: "/horarios" },
  { label: "Reportes", href: "/reportes" },
  { label: "Perfil", href: "/perfil" },
];

const professorMenu = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Reservas", href: "/reservas" },
  { label: "Horarios", href: "/horarios" },
  { label: "Perfil", href: "/perfil" },
];

export default function RoleSidebar() {
  const router = useRouter();
  const [role, setRole] = useState("Profesor");
  const [displayName, setDisplayName] = useState("Profesor");
  const [menuOpen, setMenuOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const storedRole = window.localStorage.getItem("session-role") ?? "Profesor";
    const storedName = window.localStorage.getItem("session-name");
    const storedUserId = Number(window.localStorage.getItem("session-user-id") ?? 0);
    const storedUsers = JSON.parse(window.localStorage.getItem("demo-usuarios") ?? "[]") as Array<Record<string, any>>;

    setRole(storedRole);

    if (storedName) {
      setDisplayName(storedName);
      return;
    }

    const matchedUser = storedUsers.find((user) => Number(user.id_usuario) === storedUserId);
    if (matchedUser) {
      const nextName = `${matchedUser.nombre ?? ""} ${matchedUser.apellido ?? ""}`.trim();
      setDisplayName(nextName || "Profesor");
      return;
    }

    setDisplayName(storedRole === "Superadministrador" ? "Admin" : "Profesor");
  }, []);

  const isAdmin = role === "Superadministrador";
  const menu = isAdmin ? adminMenu : professorMenu;

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("session-role");
    localStorage.removeItem("session-email");
    localStorage.removeItem("session-user-id");
    setShowLogoutModal(false);
    router.push("/login");
  };

  return (
    <>
      <aside className={`role-sidebar ${isAdmin ? "admin" : "profesor"} ${menuOpen ? "menu-open" : "menu-closed"}`}>
        <div className="sidebar-header">
          <div className="brand-box">
            <img src="/logo-institucion.png" alt="Logo institucional" className="institutional-logo" />
            <div className="brand-box-copy">
              <strong>{isAdmin ? "Admin" : displayName}</strong>
              <small>{isAdmin ? "Coordinación" : "Docente"}</small>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-toggle"
            aria-label="Alternar menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            ☰
          </button>
        </div>

        <nav className={`sidebar-menu ${menuOpen ? "open" : ""}`} aria-label="Menú lateral principal">
          {menu.map((item) => (
            <Link key={item.label} href={item.href} className="sidebar-item" onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}

          <button type="button" className="sidebar-logout" onClick={handleLogout}>
            SALIR
          </button>
        </nav>

        <div className="sidebar-legal">
          <strong>Proyecto Grado 11</strong>
          <span>Sistema de reservas académicas</span>
        </div>
      </aside>

      {showLogoutModal ? (
        <div className="logout-modal-backdrop" onClick={() => setShowLogoutModal(false)}>
          <div className="logout-modal" onClick={(event) => event.stopPropagation()}>
            <div className="logout-modal-header">
              <span className="logout-badge">Code</span>
              <button type="button" className="logout-close" onClick={() => setShowLogoutModal(false)} aria-label="Cerrar">×</button>
            </div>
            <p>¿Deseas cerrar sesión?</p>
            <div className="logout-actions">
              <button type="button" className="primary-button" onClick={confirmLogout}>Confirmar salida</button>
              <button type="button" className="secondary-button" onClick={() => setShowLogoutModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
