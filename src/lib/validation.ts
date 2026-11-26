export type JsonRecord = Record<string, unknown>;

export function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    return null;
  }

  return value.map((item) => item.trim()).filter(Boolean);
}

export function parseStoredStringArray(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return readStringArray(parsed) ?? [];
  } catch {
    return [];
  }
}
