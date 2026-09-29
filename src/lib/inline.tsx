import type { ReactNode } from 'react';

/**
 * Renders the little inline markdown the content uses. Bold segments
 * written as **text** become strong elements, everything else stays
 * plain text. No other markup is interpreted.
 */
export function renderInline(text: string): ReactNode {
  if (!text.includes('**')) return text;
  const parts = text.split('**');
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>,
  );
}
