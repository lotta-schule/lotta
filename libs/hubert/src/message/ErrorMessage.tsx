'use client';

import * as React from 'react';
import { useTheme } from '../theme';
import { Message } from './Message';

export interface ErrorMessageProps {
  error?: Error | string | null;
  className?: string;
  children?: any;
}

export const ErrorMessage = React.memo<ErrorMessageProps>(
  ({ error, className, children }) => {
    const theme = useTheme();

    const errorMessage = React.useMemo(() => {
      const errorMessage = typeof error === 'string' ? error : error?.message;
      if (errorMessage) {
        return errorMessage.replace(/^GraphQL error: /, '');
      }
    }, [error]);

    if (!(children || errorMessage)) {
      return null;
    }

    return (
      <Message
        role={'alert'}
        color={theme.errorColor}
        message={errorMessage}
        className={className}
      >
        {children}
      </Message>
    );
  }
);
ErrorMessage.displayName = 'ErrorMessage';
