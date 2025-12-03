'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-content">
                        <div className="error-icon">⚠️</div>
                        <h1 className="error-title">Oops! Something went wrong</h1>
                        <p className="error-message">
                            We encountered an unexpected error. Don't worry, your data is safe!
                        </p>
                        {this.state.error && (
                            <details className="error-details">
                                <summary>Error Details</summary>
                                <pre>{this.state.error.toString()}</pre>
                            </details>
                        )}
                        <div className="error-actions">
                            <button onClick={this.handleReset} className="btn btn-primary">
                                Return to Dashboard
                            </button>
                            <button onClick={() => window.location.reload()} className="btn btn-secondary">
                                Reload Page
                            </button>
                        </div>
                    </div>

                    <style jsx>{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: var(--spacing-xl);
              background: var(--bg-primary);
            }

            .error-content {
              max-width: 600px;
              text-align: center;
              animation: fadeIn var(--transition-slow);
            }

            .error-icon {
              font-size: 5rem;
              margin-bottom: var(--spacing-lg);
              animation: bounce 1s ease-in-out infinite;
            }

            .error-title {
              font-size: var(--text-3xl);
              font-weight: 700;
              color: var(--text-primary);
              margin-bottom: var(--spacing-md);
            }

            .error-message {
              font-size: var(--text-lg);
              color: var(--text-secondary);
              margin-bottom: var(--spacing-xl);
            }

            .error-details {
              background: var(--bg-secondary);
              border: 1px solid var(--border-color);
              border-radius: var(--radius-lg);
              padding: var(--spacing-lg);
              margin-bottom: var(--spacing-xl);
              text-align: left;
            }

            .error-details summary {
              cursor: pointer;
              font-weight: 600;
              color: var(--text-primary);
              margin-bottom: var(--spacing-md);
            }

            .error-details pre {
              font-family: var(--font-mono);
              font-size: var(--text-sm);
              color: var(--color-missed);
              overflow-x: auto;
              white-space: pre-wrap;
              word-wrap: break-word;
            }

            .error-actions {
              display: flex;
              gap: var(--spacing-md);
              justify-content: center;
              flex-wrap: wrap;
            }

            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes bounce {
              0%, 100% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-10px);
              }
            }
          `}</style>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
