import { useNavigation } from '@/adapters/router';
import { ROUTES } from '@/common/constants';
import { useCheckDetail, useShareForm } from '@/modules/checks/hooks';

export const useSharePageController = () => {
  const { goTo } = useNavigation();
  const detail = useCheckDetail();
  const form = useShareForm(detail.checkId);

  return {
    ...detail,
    form,
    goBackToResults: () => goTo(ROUTES.results(detail.checkId)),
  };
};
