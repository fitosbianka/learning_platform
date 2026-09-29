import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { hrefFor } from './useHashRoute';

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  children: ReactNode;
}

/** An anchor that points at a hash route. */
export function Link({ to, children, ...rest }: LinkProps) {
  return (
    <a href={hrefFor(to)} {...rest}>
      {children}
    </a>
  );
}
