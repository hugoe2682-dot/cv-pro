// Centralized manager config — only this email can ever be manager
export const MANAGER_EMAIL = "hugoe2682@gmail.com";

export function isManagerEmail(email: string | null | undefined): boolean {
  return email?.toLowerCase() === MANAGER_EMAIL.toLowerCase();
}
