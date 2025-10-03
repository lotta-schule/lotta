'use client';

import * as React from 'react';
import { ErrorMessage } from '@lotta-schule/hubert';

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorMessage error={error} />;
}
