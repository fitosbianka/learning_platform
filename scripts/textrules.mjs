/**
 * The text rules of the platform. No hyphen or dash of any kind, no colon
 * and no Eszett may appear in visible text, neither in the course content
 * nor in interface strings. Used by the generator (fails the build) and by
 * the content validation tests.
 */

/**
 * Hyphen minus, soft hyphen, unicode hyphens and dashes, minus sign,
 * colon and Eszett.
 */
export const FORBIDDEN_TEXT_RE = /[-­‐‑‒–—―−:ß]/;

/**
 * Recursively walks any JSON like value and returns a list of
 * { path, text } findings for every string that violates the text rules.
 *
 * @param {unknown} value
 * @param {string} path
 * @returns {{ path: string, text: string }[]}
 */
export function findForbiddenText(value, path = '') {
  /** @type {{ path: string, text: string }[]} */
  const findings = [];
  if (typeof value === 'string') {
    if (FORBIDDEN_TEXT_RE.test(value)) findings.push({ path, text: value });
    return findings;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => findings.push(...findForbiddenText(v, `${path}[${i}]`)));
    return findings;
  }
  if (value !== null && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      // Ids like L03_V01 and paths are not visible text; check everything
      // anyway except the stable ids, which never contain letters that
      // could violate the rules.
      findings.push(...findForbiddenText(v, path === '' ? k : `${path}.${k}`));
    }
  }
  return findings;
}
