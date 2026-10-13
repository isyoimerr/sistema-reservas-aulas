export const ADMIN_ROLE = "Superadministrador";
export const PROFESSOR_ROLE = "Profesor";

export function getSessionState() {
  if (typeof window === "undefined") {
    return { role: null, email: "" };
  }

  return {
    role: localStorage.getItem("session-role"),
    email: (localStorage.getItem("session-email") ?? "").trim().toLowerCase(),
  };
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
