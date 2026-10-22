import { useAuth } from '@/application';
import { useNavigation } from '@/adapters/router';
import { ROUTES } from '@/common/constants';
import {
  useManualGate,
  useRecentChecks,
  useShowScorePreference,
  useStudentDocument,
  useCheckUpload,
  usePendingCheck,
  useCheckForm,
} from '@/modules/checks/hooks';
import { getGreeting } from '@/modules/checks/utils/ScoreStyles.js';
import { ChecksConstants } from '@/modules/checks/constants/ChecksConstants.js';

export const useDashboardPageController = () => {
  const { user } = useAuth();
  const { goTo } = useNavigation();

  const gate = useManualGate();
  const recent = useRecentChecks();
  const showScore = useShowScorePreference();
  const document = useStudentDocument();
  const upload = useCheckUpload();
  const pendingCheck = usePendingCheck();
  const form = useCheckForm({ file: document.file, upload, onFailure: document.clear, onPending: pendingCheck.keep });

  // The only handler that combines concerns (file presence + form validation + a stale pending notice).
  const handleSubmit = (event) => {
    event?.preventDefault?.();
    if (!document.requireFile()) return;
    pendingCheck.dismiss(); // a new attempt replaces any earlier "try again" notice
    return form.handleSubmit(event);
  };

  return {
    userName: user?.name ?? '',
    greeting: getGreeting(),
    gate,
    lockPresentation: ChecksConstants.LOCK_PRESENTATION[gate.lock],
    form: { ...form, handleSubmit },
    document,
    upload,
    pendingCheck,
    recent,
    showScore,
    goToSettings: () => goTo(ROUTES.SETTINGS),
    goToResult: (checkId) => goTo(ROUTES.results(checkId)),
  };
};
