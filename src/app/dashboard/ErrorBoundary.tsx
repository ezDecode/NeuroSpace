'use client';

import React from 'react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Dashboard error boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
          <div className="text-red-400 font-semibold mb-1">Something went wrong.</div>
          <div className="text-red-400/70 text-sm">Try reloading the page or contact support if the problem persists.</div>
        </div>
      );
    }
    return this.props.children;
  }
}

