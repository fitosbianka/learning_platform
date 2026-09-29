import type { Block } from '../content/types';
import { renderInline } from '../lib/inline';

/** Renders the parsed content blocks of a subsection or cheat sheet. */
export function Blocks({ blocks }: { blocks: readonly Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.kind) {
          case 'p':
            return <p key={i}>{renderInline(block.text)}</p>;
          case 'label':
            return (
              <p key={i} className="blockLabel">
                {renderInline(block.text)}
              </p>
            );
          case 'ul':
            return (
              <ul key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ol>
            );
        }
      })}
    </>
  );
}
