/**
 * Escape a string for safe insertion into HTML.
 * Prevents XSS by replacing &, <, >, ", and ' with their HTML entities.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escape a string for safe insertion into Markdown.
 * Prevents markdown injection by escaping pipe, brackets, parens, and formatting chars.
 */
export function escapeMarkdown(str: string): string {
  return str.replace(/([|[\]()\\*_`#~>])/g, '\\$1');
}
