import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error) { console.error('UI error:', error) }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div role="alert" className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-forest-deep">Something went wrong</h1>
        <p className="mt-2 text-sm text-forest/70">The page hit an unexpected problem. Your data is safe.</p>
        <button type="button" onClick={() => window.location.assign('/')} className="mt-6 rounded-xl bg-forest px-5 py-2 text-cream">Back to home</button>
      </div>
    )
  }
}
