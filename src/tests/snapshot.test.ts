import { describe, expect, it } from 'vitest';
import { svgToDataUri } from '../notes/snapshot';

function makeSvg(): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 60');
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', '10');
  rect.setAttribute('y', '10');
  rect.setAttribute('width', '40');
  rect.setAttribute('height', '20');
  rect.setAttribute('fill', 'var(--vis-teal)');
  rect.setAttribute('class', 'someClass');
  rect.setAttribute('data-step', '2');
  svg.appendChild(rect);
  document.body.appendChild(svg);
  return svg;
}

function decode(uri: string): string {
  const base64 = uri.replace('data:image/svg+xml;base64,', '');
  return decodeURIComponent(escape(atob(base64)));
}

describe('drawing snapshot for the notes', () => {
  it('produces a self contained svg data uri without classes', () => {
    const svg = makeSvg();
    const uri = svgToDataUri(svg);
    svg.remove();

    expect(uri?.startsWith('data:image/svg+xml;base64,')).toBe(true);
    const xml = decode(uri ?? '');
    expect(xml).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(xml).toContain('<rect');
    expect(xml).not.toContain('someClass');
    expect(xml).not.toContain('data-step');
    expect(xml).toContain('width=');
  });
});
