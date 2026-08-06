import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackLabel?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error boundary for lazy-loaded sections.
 * Prevents one render error from blanking the entire app.
 * Pairs with React.Suspense for a complete loading + error experience.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error.message, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="section" style={{ minHeight: '200px', display: 'grid', placeItems: 'center' }}>
          <div
            className="small-pill"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              opacity: 0.85,
              padding: '20px 28px',
            }}
          >
            <AlertTriangle size={22} style={{ color: 'var(--color-pink)' }} />
            <span style={{ textAlign: 'center', fontSize: '0.95rem' }}>
              {this.props.fallbackLabel || 'Esta sección no pudo cargarse.'}
            </span>
            <button
              type="button"
              className="ghost-button"
              onClick={this.handleRetry}
              style={{ marginTop: 4, fontSize: '0.85rem' }}
            >
              <RefreshCw size={14} />
              Reintentar
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
