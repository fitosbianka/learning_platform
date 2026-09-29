/**
 * Turns a drawing of a lesson into a self contained vector image for
 * the notes. The colors of the drawings come from CSS variables, which
 * do not exist inside an image, so the computed values are baked into
 * a clone before it is serialized. The result stays a crisp vector
 * that scales perfectly on screen and in the PDF print.
 */

/** Presentation styles that must survive without the page stylesheet. */
const BAKED_PROPS = [
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-dasharray',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-opacity',
  'opacity',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'letter-spacing',
  'text-anchor',
  'dominant-baseline',
  'color',
  'stop-color',
  'stop-opacity',
];

const MAX_XML_CHARS = 120000;

export function svgToDataUri(svg: SVGSVGElement): string | null {
  try {
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const originals: Element[] = [svg, ...svg.querySelectorAll('*')];
    const copies: Element[] = [clone, ...clone.querySelectorAll('*')];
    for (let i = 0; i < originals.length; i += 1) {
      const source = originals[i];
      const target = copies[i];
      if (!source || !target) continue;
      const computed = window.getComputedStyle(source);
      for (const prop of BAKED_PROPS) {
        const value = computed.getPropertyValue(prop);
        if (value && value !== '') target.setAttribute(prop, value);
      }
      // Classes and inline handlers mean nothing inside an image.
      target.removeAttribute('class');
      target.removeAttribute('style');
      target.removeAttribute('tabindex');
      for (const attr of [...target.attributes]) {
        if (attr.name.startsWith('on') || attr.name.startsWith('data-') || attr.name.startsWith('aria-')) {
          target.removeAttribute(attr.name);
        }
      }
    }

    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    if (!clone.getAttribute('viewBox') && svg.viewBox.baseVal) {
      const box = svg.viewBox.baseVal;
      if (box.width > 0) clone.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    }
    const rect = svg.getBoundingClientRect();
    const width = Math.round(rect.width) || 640;
    const height = Math.round(rect.height) || 420;
    clone.setAttribute('width', String(width));
    clone.setAttribute('height', String(height));

    const xml = new XMLSerializer().serializeToString(clone);
    if (xml.length > MAX_XML_CHARS) return null;
    const base64 = window.btoa(unescape(encodeURIComponent(xml)));
    return `data:image/svg+xml;base64,${base64}`;
  } catch {
    return null;
  }
}
