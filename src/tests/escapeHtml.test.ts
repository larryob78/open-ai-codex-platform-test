import { describe, it, expect } from 'vitest';
import { escapeHtml, escapeMarkdown } from '../utils/escapeHtml';

describe('escapeHtml', () => {
  it('escapes ampersands', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('escapes angle brackets', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  it('escapes double quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#39;s');
  });

  it('handles empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('leaves safe strings unchanged', () => {
    expect(escapeHtml('Hello World 123')).toBe('Hello World 123');
  });

  it('escapes a realistic XSS payload', () => {
    const payload = '"><img src=x onerror=alert(1)>';
    const result = escapeHtml(payload);
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
    expect(result).toBe('&quot;&gt;&lt;img src=x onerror=alert(1)&gt;');
  });
});

describe('escapeMarkdown', () => {
  it('escapes pipe characters', () => {
    expect(escapeMarkdown('col1 | col2')).toBe('col1 \\| col2');
  });

  it('escapes square brackets', () => {
    expect(escapeMarkdown('[link](url)')).toBe('\\[link\\]\\(url\\)');
  });

  it('escapes asterisks and underscores', () => {
    expect(escapeMarkdown('**bold** _italic_')).toBe('\\*\\*bold\\*\\* \\_italic\\_');
  });

  it('escapes backticks', () => {
    expect(escapeMarkdown('`code`')).toBe('\\`code\\`');
  });

  it('escapes hash characters', () => {
    expect(escapeMarkdown('# heading')).toBe('\\# heading');
  });

  it('leaves plain text unchanged', () => {
    expect(escapeMarkdown('Hello World 123')).toBe('Hello World 123');
  });
});
