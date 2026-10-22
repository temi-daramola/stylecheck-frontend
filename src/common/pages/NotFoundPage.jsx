import { BaseNotify } from '@/common/components';
import { SearchIcon } from '@/adapters/icons';
import { useNavigation } from '@/adapters/router';
import { COLORS, ROUTES } from '@/common/constants';

export const NotFoundPage = () => {
  const { goTo } = useNavigation();

  return (
    <BaseNotify
      minHeight="60vh"
      justify="center"
      icon={<SearchIcon size={36} color={COLORS.secondary.base} />}
      title="Page not found"
      message="The page you're looking for doesn't exist or may have been moved."
      actionLabel="Go to dashboard"
      onAction={() => goTo(ROUTES.DASHBOARD)}
    />
  );
};
