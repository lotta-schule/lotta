import * as React from 'react';
import { ErrorMessage } from '@lotta-schule/hubert';

export default function NotFound() {
  return <ErrorMessage error={new Error('Seite nicht gefunden')} />;
}
