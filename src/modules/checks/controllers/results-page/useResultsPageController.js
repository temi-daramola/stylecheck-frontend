import { useNavigation } from '@/adapters/router';
import { ROUTES } from '@/common/constants';
import { useCheckDetail, useDownloadReport } from '@/modules/checks/hooks';

export const useResultsPageController = () => {
  const { goTo } = useNavigation();
  const detail = useCheckDetail();
  const report = useDownloadReport();

  return {
    ...detail,
    isDownloading: report.isDownloading,
    downloadReport: () => report.download(detail.checkId),
    goToShare: () => goTo(ROUTES.share(detail.checkId)),
    goToDashboard: () => goTo(ROUTES.DASHBOARD),
  };
};
