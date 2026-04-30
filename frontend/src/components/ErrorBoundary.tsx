import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', marginTop: '10vh' }}>
          <h1 style={{ color: 'var(--danger)' }}>Oops, something went wrong.</h1>
          <p style={{ color: 'var(--text-muted)' }}>The application encountered an unexpected error.</p>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = '/';
            }}
            style={{ marginTop: '1rem' }}
          >
            Go back home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
