import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface px-6">
          <div className="max-w-md w-full rounded-xl border border-border bg-surface-2 p-8 text-center shadow-lg">
            <div className="mb-4 font-mono text-xs uppercase tracking-[0.24em] text-accent">
              system_error
            </div>
            <h2 className="font-mono text-2xl font-bold text-text mb-3">
              Something went wrong.
            </h2>
            <p className="font-sans text-sm text-text-muted mb-6">
              A component in this page failed to render. Reload the page to try again.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 font-mono text-xs font-semibold text-on-accent transition hover:opacity-90"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
