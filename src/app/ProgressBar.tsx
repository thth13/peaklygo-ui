'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
// Disable Font Awesome auto CSS injection to avoid layout shift
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false;

export default function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  return null;
}
