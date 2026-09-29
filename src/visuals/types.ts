import type { ComponentType } from 'react';

/**
 * Contract between the lesson page and the hand built visuals.
 * Every lesson folder (src/visuals/L03/index.tsx) default exports an
 * array of these, one entry per item of the Visuals section in the
 * content, placed after the content subsection it belongs to.
 */
export interface LessonVisual {
  /** Visual id from the content, e.g. L03_V01 */
  id: string;
  /** 0 based index of the content subsection after which the visual renders */
  afterSection: number;
  Component: ComponentType;
}
