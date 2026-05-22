/**
 * Sanitization utilities for cleaning data from external sources (Sanity, user input, etc.)
 * 
 * These functions remove invisible/problematic Unicode characters that can cause
 * string matching issues, display problems, or security vulnerabilities.
 */

/**
 * Removes invisible and zero-width Unicode characters from a string.
 * 
 * This includes:
 * - Zero-width spaces (U+200B)
 * - Zero-width non-joiners (U+200C)
 * - Zero-width joiners (U+200D)
 * - Byte order marks (U+FEFF)
 * - Non-breaking spaces (U+00A0)
 * - Word joiners (U+2060)
 * - Mongolian vowel separators (U+180E)
 * - Other invisible formatting characters
 * 
 * @param str - The string to clean
 * @returns The cleaned string with invisible characters removed
 * 
 * @example
 * ```ts
 * const dirty = "Text4​​​​‌﻿‍﻿​‍​‍‌‍"; // Has invisible characters
 * const clean = removeInvisibleChars(dirty);
 * console.log(clean); // "Text4"
 * ```
 */
export function removeInvisibleChars(str: string): string {
  if (!str || typeof str !== 'string') return str;
  
  return str
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Remove other invisible/formatting characters
    .replace(/[\u00A0\u2060\u180E]/g, '')
    // Remove directional marks
    .replace(/[\u202A-\u202E]/g, '')
    // Remove other format characters
    .replace(/[\u2066-\u2069]/g, '')
    // Trim any remaining whitespace
    .trim();
}

/**
 * Recursively sanitizes all string values in an object or array.
 * 
 * This is useful for cleaning entire Sanity query results or API responses
 * that may contain invisible Unicode characters in multiple fields.
 * 
 * @param data - The data to sanitize (object, array, or primitive)
 * @returns The sanitized data with all strings cleaned
 * 
 * @example
 * ```ts
 * const sanityData = {
 *   title: "Hello​​​World",
 *   fields: ["Text4​​​", "Text5​​​"],
 *   nested: { name: "Test​​​" }
 * };
 * 
 * const clean = sanitizeSanityData(sanityData);
 * // {
 * //   title: "HelloWorld",
 * //   fields: ["Text4", "Text5"],
 * //   nested: { name: "Test" }
 * // }
 * ```
 */
export function sanitizeSanityData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle strings
  if (typeof data === 'string') {
    return removeInvisibleChars(data) as T;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeSanityData(item)) as T;
  }

  // Handle objects
  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeSanityData(value);
    }
    return sanitized as T;
  }

  // Return primitives as-is (numbers, booleans, etc.)
  return data;
}

/**
 * Sanitizes a Sanity field mapping object specifically.
 * 
 * This is a specialized version for PDF field maps and similar configurations
 * where all values should be cleaned strings.
 * 
 * @param fieldMap - Object with string values to clean
 * @returns Cleaned field map
 * 
 * @example
 * ```ts
 * const fieldMap = {
 *   propertyTitle: "Text4​​​",
 *   buyerName: "Text5​​​"
 * };
 * 
 * const clean = sanitizeFieldMap(fieldMap);
 * // { propertyTitle: "Text4", buyerName: "Text5" }
 * ```
 */
export function sanitizeFieldMap<T extends Record<string, string | undefined>>(
  fieldMap: T
): T {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(fieldMap)) {
    if (typeof value === 'string') {
      sanitized[key] = removeInvisibleChars(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}