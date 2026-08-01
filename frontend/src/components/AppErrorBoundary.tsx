import { Component, type ErrorInfo, type ReactNode } from 'react';

type State = { hasError: boolean };

export default class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State { return { hasError: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('EA-HTS application error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <main className="app-loading-screen"><section className="app-loading-card app-error-card"><p className="app-loading-eyebrow">EA-HTS Summit 2027</p><h1>EA-HTS Summit encountered an issue.</h1><p>Please reload the application to continue.</p><button type="button" className="app-error-reload" onClick={() => window.location.reload()}>Reload application</button></section></main>;
    }
    return this.props.children;
  }
}
