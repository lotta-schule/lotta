import * as React from 'react';
import { ErrorMessage } from '@lotta-schule/hubert';

export default function NotFound() {
  // Pass a string: Error objects passed to client components are serialized
  // by React and their message is hidden in production builds.
  return <ErrorMessage error={'Seite nicht gefunden'} />;
}
