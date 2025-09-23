'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NProgress from 'nprogress';
import { useEffect } from 'react';

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  passHref?: boolean;
  legacyBehavior?: boolean;
  onClick?: () => void;
};

export default function LinkWithProgress({ href, children, className, passHref, legacyBehavior, onClick }: Props) {
  const pathname = usePathname();

  const handleClick = () => {
    if (pathname !== href) {
      NProgress.start();
    }
    onClick?.();
  };

  useEffect(() => {
    NProgress.done();
  }, [pathname]);

  return (
    <Link href={href} onClick={handleClick} className={className} passHref={passHref} legacyBehavior={legacyBehavior}>
      {children}
    </Link>
  );
}
