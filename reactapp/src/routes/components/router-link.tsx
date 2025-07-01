// import type { LinkProps } from 'react-router';

// import { Link } from 'react-router';

// // ----------------------------------------------------------------------

// interface RouterLinkProps extends Omit<LinkProps, 'to'> {
//   href: string;
//   ref?: React.RefObject<HTMLAnchorElement | null>;
// }

// export function RouterLink({ href, ref, ...other }: RouterLinkProps) {
//   return <Link ref={ref} to={href} {...other} />;
// }

import type { LinkProps } from 'react-router-dom'; // Dùng đúng package
import { Link } from 'react-router-dom';
import React from 'react';

// ----------------------------------------------------------------------

interface RouterLinkProps extends Omit<LinkProps, 'to'> {
  href: string;
}

// React.forwardRef cần tên function tường minh cho debugging
export const RouterLink = React.forwardRef<HTMLAnchorElement, RouterLinkProps>(
  ({ href, ...other }, ref) => {
    return <Link ref={ref} to={href} {...other} />;
  }
);
