import { Component, type ReactNode } from 'react';

/** Keep navigation, reading links and quizzes available if one experiment fails. */
export class LabBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }

  render() {
    if (!this.state.failed) return this.props.children;
    return <section className="lab-error" role="alert">
      <h3>本章实验暂时无法显示</h3>
      <p>可以重新载入本章，或先查看学习路径与自测。已保存的学习记录会继续保留。</p>
      <button type="button" className="mini-button" onClick={() => window.location.reload()}>重新载入本章</button>
    </section>;
  }
}
