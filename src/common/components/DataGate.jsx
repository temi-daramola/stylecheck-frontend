import { FormSkeleton, ListSkeleton, CardSkeleton } from './Skeleton';
import { StatusNotify } from './Notify';

const SKELETONS_BY_TYPE = { form: FormSkeleton, list: ListSkeleton, card: CardSkeleton };

/**
 * Initial-load gate: loading -> error -> ready. It gates *mounting*, not just rendering, so
 * whatever is passed as `children` (and any hooks inside it) only exists once the data is there.
 */
export const DataGate = ({
  isLoading,
  isError,
  error,
  errorTitle = 'Something went wrong',
  onRetry,
  skeletonType,
  customLoadingView,
  children,
}) => {
  if (isLoading) {
    if (customLoadingView) return customLoadingView;
    const Skeleton = SKELETONS_BY_TYPE[skeletonType];
    return Skeleton ? <Skeleton /> : null;
  }

  if (isError) {
    return (
      <StatusNotify
        state="error"
        title={errorTitle}
        message={error?.message}
        actionLabel={onRetry ? 'Try again' : undefined}
        onAction={onRetry}
      />
    );
  }

  return children;
};
