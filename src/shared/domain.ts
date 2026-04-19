export function normalizeDomain(input: string): string | null {
  try {
    const host = input.includes('://') ? new URL(input).hostname : input;
    const cleaned = host
      .toLowerCase()
      .replace(/^www\./, '')
      .trim();
    return cleaned || null;
  } catch {
    return null;
  }
}
