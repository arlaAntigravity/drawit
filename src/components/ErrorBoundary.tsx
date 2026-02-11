'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            backgroundColor: '#0a0a0f',
            color: '#e4e4e7',
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            padding: '2rem',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              textAlign: 'center',
              padding: '2.5rem',
              borderRadius: '16px',
              backgroundColor: 'rgba(30, 30, 46, 0.9)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              boxShadow: '0 0 40px rgba(99, 102, 241, 0.1)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 1.5rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}
            >
              ⚠️
            </div>

            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                marginBottom: '0.75rem',
                color: '#f4f4f5',
              }}
            >
              Что-то пошло не так
            </h2>

            <p
              style={{
                fontSize: '0.875rem',
                color: '#a1a1aa',
                marginBottom: '1.5rem',
                lineHeight: 1.6,
              }}
            >
              Произошла ошибка при отрисовке компонента. Вы можете попробовать
              перезагрузить область или обновить страницу.
            </p>

            {this.state.error && (
              <pre
                style={{
                  fontSize: '0.75rem',
                  color: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  marginBottom: '1.5rem',
                  textAlign: 'left',
                  overflow: 'auto',
                  maxHeight: '120px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {this.state.error.message}
              </pre>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  color: '#818cf8',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
                }}
              >
                Попробовать снова
              </button>

              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#a1a1aa',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                Обновить страницу
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
