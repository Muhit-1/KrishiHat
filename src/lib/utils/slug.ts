export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export function generateUniqueSlug(text: string, suffix?: string): string {
  const base = generateSlug(text);
  return suffix ? `${base}-${suffix}` : base;
}