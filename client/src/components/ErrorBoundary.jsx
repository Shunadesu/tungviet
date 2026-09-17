import { Component } from 'react';

/**
 * ErrorBoundary — catches React render errors in the component tree and
 * renders a graceful fallback instead of a blank white screen.
 *
 * Usage: wrap any subtree with <ErrorBoundary>. Place at the root of the
 * app (in main.jsx) to catch everything, or wrap individual route components
 * for granular recovery.
 *
 * How it works:
 *   - getDerivedStateFromError() stores the error in state so we can render
 *     a fallback UI on the next render.
 *   - componentDidCatch() logs the error server-side for monitoring.
 *   - The fallback shows a user-friendly message and a "Try again" button
 *     that resets the error state so the component tries to re-render.
 *
 * The boundary intentionally does NOT catch:
 *   - Event handlers (onClick, onChange, etc.) — those use try/catch.
 *   - Async code (useEffect, fetch) — those use .catch() in hooks.
 *   - Server-side errors — those are handled by the Express errorHandler.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to console in dev; send to an error tracking service (e.g. Sentry)
    // in production.
    const logEntry = {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    if (import.meta.env.PROD) {
      // TODO: replace with your error tracking endpoint, e.g.:
      // fetch('/api/errors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(logEntry) });
      console.error('[ErrorBoundary]', logEntry);
    } else {
      console.error('[ErrorBoundary]', logEntry);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({ error: this.state.error, reset: this.handleReset });
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-[40vh] flex flex-col items-center justify-center px-4 py-16 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-400" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-500 max-w-sm mb-6">
            We encountered an unexpected error. Your data is safe — please try again or refresh the page.
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
