import { Component } from 'react';
import { BaseNotify } from './Notify';
import { ErrorIcon } from '@/adapters/icons';
import { COLORS } from '@/common/constants';

/** Catches render crashes below it. One per layout, wrapping the <Outlet />, so the shell stays usable. */
export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // Render crashes are bugs: surface them in the console for developers.
    console.error('[ErrorBoundary]', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <BaseNotify
          icon={<ErrorIcon size={36} color={COLORS.error.base} />}
          title="Something went wrong"
          message="An unexpected error occurred on this page. Please reload."
          actionLabel="Reload page"
          onAction={() => window.location.reload()}
        />
      );
    }
    return this.props.children;
  }
}
