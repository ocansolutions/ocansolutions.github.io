// Formats site copy for `set:html`. Order matters:
// 1. escape HTML, 2. `*x*` becomes <em>x</em> (red accent, styled in CSS),
// 3. "Türkiye" gets lang="tr" so `text-transform: uppercase` renders TÜRKİYE (dotted İ).

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export function rich(text: string): string {
  return escapeHtml(text)
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/Türkiye/g, '<span lang="tr">Türkiye</span>');
}
