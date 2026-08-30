export const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const uid = (): string => crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const attribute = (value: string | number): string => escapeHtml(value);
