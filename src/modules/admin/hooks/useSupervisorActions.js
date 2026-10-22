import { useSetCache } from '@/adapters/query';
import { useMutationWithFeedback, useConfirm } from '@/common/hooks';
import { QUERY_KEYS } from '@/common/constants';
import { resendInvite, setSupervisorActive } from '@/modules/admin/services/AdminServices.js';
import { AdminConstants } from '@/modules/admin/constants/AdminConstants.js';

const { MESSAGES, CONFIRM_DEACTIVATE } = AdminConstants;

/** Per-row actions: resend an invite, deactivate (after confirming) or reactivate. */
export const useSupervisorActions = () => {
  const setCache = useSetCache();
  const { confirm, dialogProps } = useConfirm();

  const invite = useMutationWithFeedback({
    mutationFn: resendInvite,
    successMessage: MESSAGES.INVITE_SENT,
    errorMessage: MESSAGES.INVITE_FALLBACK_ERROR,
  });

  const toggleActive = useMutationWithFeedback({
    mutationFn: setSupervisorActive,
    errorMessage: MESSAGES.UPDATE_FALLBACK_ERROR,
    // One account changed state: swap that single row in the cached list. Position and count are unchanged.
    onSuccessCache: (response) =>
      setCache(QUERY_KEYS.ADMIN_SUPERVISORS, (cached) =>
        cached
          ? {
              ...cached,
              data: { ...cached.data, items: cached.data.items.map((item) => (item.id === response.data.id ? response.data : item)) },
            }
          : cached
      ),
  });

  const deactivate = async (supervisor) => {
    // The mutation only runs after the confirmation resolves true.
    if (await confirm(CONFIRM_DEACTIVATE(supervisor.name))) {
      toggleActive.mutate({ supervisorId: supervisor.id, isActive: false });
    }
  };

  return {
    sendInvite: (supervisor) => invite.mutate(supervisor.id),
    pendingInviteId: invite.isPending ? invite.variables : null,
    deactivate,
    reactivate: (supervisor) => toggleActive.mutate({ supervisorId: supervisor.id, isActive: true }),
    pendingActiveId: toggleActive.isPending ? toggleActive.variables?.supervisorId : null,
    confirmDialogProps: dialogProps,
  };
};
