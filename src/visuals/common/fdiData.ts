/**
 * FDI tooth data used by the interactive tooth chart. Every statement in
 * here mirrors the course content of lessons 2 and 3.
 */

export type Dentition = 'permanent' | 'primary';

export const POSITION_NAMES = [
  'Mittlerer Schneidezahn',
  'Seitlicher Schneidezahn',
  'Eckzahn',
  'Erster Prämolar',
  'Zweiter Prämolar',
  'Erster Molar',
  'Zweiter Molar',
  'Dritter Molar, der Weisheitszahn',
] as const;

export const PRIMARY_POSITION_NAMES = [
  'Mittlerer Milchschneidezahn',
  'Seitlicher Milchschneidezahn',
  'Milcheckzahn',
  'Erster Milchmolar',
  'Zweiter Milchmolar',
] as const;

export const QUADRANT_LOCATIONS: Record<number, string> = {
  1: 'oben rechts',
  2: 'oben links',
  3: 'unten links',
  4: 'unten rechts',
  5: 'oben rechts',
  6: 'oben links',
  7: 'unten links',
  8: 'unten rechts',
};

const DIGIT_WORDS = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];

export function quadrantOf(fdi: number): number {
  return Math.floor(fdi / 10);
}

export function positionOf(fdi: number): number {
  return fdi % 10;
}

export function isPrimaryTooth(fdi: number): boolean {
  return quadrantOf(fdi) >= 5;
}

/** "26" becomes "zwei sechs", the way the number is spoken in the praxis. */
export function spokenNumber(fdi: number): string {
  return `${DIGIT_WORDS[quadrantOf(fdi)]} ${DIGIT_WORDS[positionOf(fdi)]}`;
}

/** Full name like "Erster Molar oben links". */
export function toothName(fdi: number): string {
  const pos = positionOf(fdi);
  const base = isPrimaryTooth(fdi) ? PRIMARY_POSITION_NAMES[pos - 1] : POSITION_NAMES[pos - 1];
  return `${base ?? ''} ${QUADRANT_LOCATIONS[quadrantOf(fdi)] ?? ''}`.trim();
}

/** Extra note from the content for special teeth. */
export function toothNote(fdi: number): string | null {
  if (isPrimaryTooth(fdi)) {
    if (fdi === 71 || fdi === 81) {
      return 'Der erste Milchzahn kommt meist mit etwa 6 Monaten, untere mittlere Schneidezähne zuerst.';
    }
    return null;
  }
  const pos = positionOf(fdi);
  if (pos === 6) return 'Sechsjahrmolar, bricht mit etwa 6 Jahren durch, ohne dass ein Milchzahn ausfällt.';
  if (pos === 7) return 'Zwölfjahrmolar, bricht mit etwa 12 Jahren durch.';
  if (pos === 8) return 'Weisheitszahn, kommt zwischen 17 und 25 Jahren, teilweise oder gar nicht.';
  return null;
}

/** Typical eruption age from lesson 2, permanent teeth by position. */
export function eruptionText(fdi: number): string {
  if (isPrimaryTooth(fdi)) {
    return 'Milchgebiss, vollständig mit etwa zweieinhalb bis drei Jahren.';
  }
  const pos = positionOf(fdi);
  if (pos <= 2) return 'Durchbruch mit etwa 6 bis 8 Jahren.';
  if (pos <= 5) return 'Durchbruch mit etwa 9 bis 12 Jahren.';
  if (pos === 6) return 'Durchbruch mit etwa 6 Jahren.';
  if (pos === 7) return 'Durchbruch mit etwa 12 Jahren.';
  return 'Durchbruch zwischen 17 und 25 Jahren, teilweise oder gar nicht.';
}

/** Number of roots from lesson 2, permanent teeth only. */
export function rootsText(fdi: number): string | null {
  if (isPrimaryTooth(fdi)) return null;
  const pos = positionOf(fdi);
  const upper = quadrantOf(fdi) <= 2;
  if (pos <= 2) return 'Eine Wurzel.';
  if (pos === 3) return 'Eine Wurzel, die längste im Gebiss.';
  if (pos === 4) return upper ? 'Meist eine Wurzel, der erste obere Prämolar oft zwei.' : 'Meist eine Wurzel.';
  if (pos === 5) return 'Meist eine Wurzel.';
  return upper ? 'Meist drei Wurzeln.' : 'Meist zwei Wurzeln.';
}

export function toothTypeText(fdi: number): string {
  const pos = positionOf(fdi);
  if (isPrimaryTooth(fdi)) {
    if (pos <= 2) return 'Milchschneidezahn, zum Abbeissen.';
    if (pos === 3) return 'Milcheckzahn, zum Festhalten.';
    return 'Milchmolar, zum Zermahlen, Platzhalter für die Prämolaren.';
  }
  if (pos <= 2) return 'Schneidezahn (Incisivus), meisselförmig, zum Abbeissen.';
  if (pos === 3) return 'Eckzahn (Caninus), spitz, zum Festhalten und für die Führung.';
  if (pos <= 5) return 'Prämolar, zwei Höcker, zum Zerkleinern.';
  return 'Molar, grosse Kaufläche, zum Zermahlen.';
}

/** All FDI numbers of one arch, in drawing order from viewer left to right. */
export function archTeeth(dentition: Dentition, arch: 'upper' | 'lower'): number[] {
  const positions = dentition === 'permanent' ? [8, 7, 6, 5, 4, 3, 2, 1] : [5, 4, 3, 2, 1];
  const result: number[] = [];
  if (arch === 'upper') {
    const right = dentition === 'permanent' ? 1 : 5;
    const left = dentition === 'permanent' ? 2 : 6;
    for (const p of positions) result.push(right * 10 + p);
    for (const p of [...positions].reverse()) result.push(left * 10 + p);
  } else {
    const right = dentition === 'permanent' ? 4 : 8;
    const left = dentition === 'permanent' ? 3 : 7;
    for (const p of positions) result.push(right * 10 + p);
    for (const p of [...positions].reverse()) result.push(left * 10 + p);
  }
  return result;
}

export function allTeeth(dentition: Dentition): number[] {
  return [...archTeeth(dentition, 'upper'), ...archTeeth(dentition, 'lower')];
}
