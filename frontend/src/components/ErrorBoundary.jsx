import { Component } from 'react'
import ErrorPage from '../pages/ErrorPage.jsx'

/**
 * Catches unhandled React render/lifecycle errors.
 * Renders the "crash" error page so the app doesn't go fully blank.
 *
 * Usage: wrap <App /> in <ErrorBoundary navigate={...} />
 */
export default class ErrorBoundary extends Component {
  state = { crashed: false, message: '' }

  static getDerivedStateFromError(error) {
    return { crashed: true, message: error?.message ?? 'Unknown error' }
  }

  componentDidCatch(error, info) {
    // In production you'd send this to a logging service (Sentry, etc.)
    console.error('[ErrorBoundary] Unhandled render error:', error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ crashed: false, message: '' })
  }

  render() {
    if (this.state.crashed) {
      return (
        <ErrorPage
          type="crash"
          navigate={this.props.navigate ?? (() => {})}
          onRetry={this.handleRetry}
          errorMessage={this.state.message}
        />
      )
    }
    return this.props.children
  }
}
