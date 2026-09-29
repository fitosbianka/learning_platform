import type { CSSProperties, ReactNode } from 'react';

interface VisualFrameProps {
  /** Short caption under the visual, in German, following the text rules */
  caption: string;
  /** Alt description. For plain graphics it labels the image */
  alt: string;
  /** Interactive visuals keep their inner semantics instead of role img */
  interactive?: boolean;
  /** Reserved aspect ratio of the drawing area, avoids layout shift */
  aspect?: number;
  children: ReactNode;
}

/**
 * Shared frame around every visual. Provides the card look, the caption,
 * the accessible label and a reserved aspect ratio box so the layout does
 * not shift while a lesson loads.
 */
export function VisualFrame({ caption, alt, interactive = false, aspect, children }: VisualFrameProps) {
  const style: CSSProperties | undefined = aspect ? ({ '--visual-aspect': String(aspect) } as CSSProperties) : undefined;
  return (
    <figure className="visualFrame">
      {interactive ? (
        <div className="visualBody" role="group" aria-label={alt} style={style}>
          {children}
        </div>
      ) : (
        <div className="visualBody" role="img" aria-label={alt} style={style}>
          {children}
        </div>
      )}
      <figcaption className="visualCaption">{caption}</figcaption>
    </figure>
  );
}
