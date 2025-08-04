'use client';

import { GoogleAnalytics as GA } from '@next/third-parties/google';

interface GoogleAnalyticsProps {
  gaId: string;
}

export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  return <GA gaId={gaId} />;
}