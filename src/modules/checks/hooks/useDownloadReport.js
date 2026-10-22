import { useMutationWithFeedback } from '@/common/hooks';
import { saveBlob } from '@/adapters/download';
import { downloadCheckReport } from '@/modules/checks/services/CheckServices.js';
import { ChecksConstants } from '@/modules/checks/constants/ChecksConstants.js';

export const useDownloadReport = () => {
  const { mutate, isPending } = useMutationWithFeedback({
    mutationFn: downloadCheckReport,
    errorMessage: ChecksConstants.MESSAGES.DOWNLOAD_FALLBACK_ERROR,
    silentSuccess: true, // the browser's own download UI is the feedback
    onSuccessCache: ({ blob, fileName }) => saveBlob(blob, fileName),
  });

  return { download: mutate, isDownloading: isPending };
};
