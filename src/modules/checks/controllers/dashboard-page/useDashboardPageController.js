import { useAuth } from '@/application';
import { useNavigation } from '@/adapters/router';
import { ROUTES } from '@/common/constants';
import {
  useManualGate,
  useRecentChecks,
  useShowScorePreference,
  useStudentDocument,
  useCheckUpload,
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
  const form = useCheckForm({ file: document.file, upload, onFailure: document.clear });

  // The only handler that combines two concerns (file presence + form validation), so it lives here.
  const handleSubmit = (event) => {
    event?.preventDefault?.();
    if (!document.requireFile()) return;
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
    recent,
    showScore,
    goToSettings: () => goTo(ROUTES.SETTINGS),
    goToResult: (checkId) => goTo(ROUTES.results(checkId)),
  };
};
