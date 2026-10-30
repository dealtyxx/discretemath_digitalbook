import { Component, createRef, type ReactNode } from 'react';

let webgl2Available: boolean | undefined;

/** Match three.js's WebGL2 requirement before mounting a renderer. */
export function supportsWebGL2(): boolean {
  if (webgl2Available !== undefined) return webgl2Available;
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2', { alpha: true, antialias: true });
    webgl2Available = context !== null;
    context?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webgl2Available = false;
  }
  return webgl2Available;
}

interface GraphicsBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  onUnavailable: () => void;
}

/** A failed or lost graphics context must not unmount the whole textbook. */
export class GraphicsBoundary extends Component<GraphicsBoundaryProps, { failed: boolean }> {
  state = { failed: false };
  private host = createRef<HTMLDivElement>();
  private onContextLost = (event: Event) => {
    event.preventDefault();
    this.setState({ failed: true });
    this.props.onUnavailable();
  };

  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onUnavailable(); }
  componentDidMount() { this.host.current?.addEventListener('webglcontextlost', this.onContextLost, true); }
  componentWillUnmount() { this.host.current?.removeEventListener('webglcontextlost', this.onContextLost, true); }

  render() {
    return <div ref={this.host} className="graphics-boundary">{this.state.failed ? this.props.fallback : this.props.children}</div>;
  }
}
