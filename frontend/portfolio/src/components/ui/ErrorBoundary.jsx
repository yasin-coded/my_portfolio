import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    if (this.props.onReset) {
      this.setState({ hasError: false, error: null, errorInfo: null });
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const isDev = Boolean(import.meta.env?.DEV);
      const errorMessage = this.state.error?.message || String(this.state.error);
      const stackLines = this.state.error?.stack
        ? this.state.error.stack.split('\n').slice(0, 5).join('\n')
        : null;

      return (
        <div className="min-h-[300px] flex items-center justify-center p-6">
          <div className="max-w-xl w-full rounded-xl border border-border bg-surface-2 p-6 md:p-8 text-center shadow-lg">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-danger/10 text-danger mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="mb-2 font-mono text-xs uppercase tracking-[0.24em] text-accent">
              // system_error
            </div>

            <h2 className="font-mono text-xl font-bold text-text mb-2">
              Component Render Error
            </h2>

            <p className="font-sans text-xs text-text-muted mb-4">
              An unexpected error occurred while rendering this component.
            </p>

            {isDev && (
              <div className="mb-5 p-3 rounded-md bg-bg border border-danger/40 text-left overflow-x-auto">
                <p className="font-mono text-xs font-bold text-danger mb-1">
                  {errorMessage}
                </p>
                {stackLines && (
                  <pre className="font-mono text-[10px] text-text-muted whitespace-pre-wrap leading-relaxed">
                    {stackLines}
                  </pre>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 font-mono text-xs font-semibold text-on-accent transition hover:opacity-90 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reload Component
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
