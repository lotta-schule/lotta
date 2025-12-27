import * as React from 'react';
import { Box, Button } from '@lotta-schule/hubert';
import { ServerDownErrorPage } from 'layout/error/ServerDownErrorPage';
import { reload } from 'util/browserLocation';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error as Error;
      return (
        <Box style={{ textAlign: 'center' }}>
          <ServerDownErrorPage error={error} />
          <Button onClick={() => reload()}>neu laden</Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
