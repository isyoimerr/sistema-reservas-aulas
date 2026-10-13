export const ADMIN_ROLE = "Superadministrador";
export const PROFESSOR_ROLE = "Profesor";

export function getSessionState() {
  if (typeof window === "undefined") {
    return { role: null, email: "", userId: null };
  }

  return {
    role: localStorage.getItem("session-role"),
    email: (localStorage.getItem("session-email") ?? "").trim().toLowerCase(),
    userId: localStorage.getItem("session-user-id"),
  };
}

export function getSessionUserId() {
  const { userId } = getSessionState();
  return userId ? Number(userId) : null;
}

export function isAdminSession() {
  const { role, email } = getSessionState();
  return role === ADMIN_ROLE && Boolean(email);
}

export function isProfessorSession() {
  const { role, email } = getSessionState();
  return role === PROFESSOR_ROLE && Boolean(email);
}

export function isAuthenticatedRole(role: string | null) {
  return role === ADMIN_ROLE || role === PROFESSOR_ROLE;
}

export function canAccessRoute(pathname: string, role: string | null) {
  const normalizedPath = pathname.split("?")[0].replace(/\/$/, "") || "/";

  const adminRoutes = ["/admin", "/aulas", "/usuarios", "/reportes"];
  const professorRoutes = ["/dashboard", "/horarios", "/reservas", "/perfil"];

  if (role === ADMIN_ROLE) {
    return true;
  }

  if (role === PROFESSOR_ROLE) {
    return professorRoutes.includes(normalizedPath) || normalizedPath === "/login" || normalizedPath === "/";
  }

  return normalizedPath === "/login" || normalizedPath === "/";
}
