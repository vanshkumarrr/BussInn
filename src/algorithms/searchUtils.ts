/**
 * Removes extra spaces and converts text to lowercase.
 */
export function normalizeText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}


/**
 * Returns true if two stop names are the same,
 * ignoring spaces and letter casing.
 */
export function isSameStop(a: string, b: string): boolean {
  return normalizeText(a) === normalizeText(b);
}

/**
 * Returns true if a stop name contains the search text.
 * Useful for future partial matching.
 */
export function containsStop(stopName: string, search: string): boolean {
  return normalizeText(stopName).includes(normalizeText(search));
}