export const ADMIN_EMAIL = "admin@bagateargo.store"

export function isAdminEmail(email: string | null | undefined): boolean {
  return (email ?? "").trim().toLowerCase() === ADMIN_EMAIL
}
