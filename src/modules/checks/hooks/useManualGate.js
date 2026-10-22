import { useFetch } from '@/adapters/query';
import { QUERY_KEYS } from '@/common/constants';
import { fetchMyManual } from '@/common/services';
import { getManualState, MANUAL_STATE } from '@/common/utils';
import { getDashboardLock } from '@/modules/checks/utils/GetDashboardLock.js';

export const useManualGate = () => {
  const query = useFetch(QUERY_KEYS.MANUAL, fetchMyManual);
  const state = getManualState(query.data);
  const lock = getDashboardLock({
    manual: state !== MANUAL_STATE.NONE,
    manualReady: state === MANUAL_STATE.READY,
  });

  return {
    lock,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    retry: query.refetch,
  };
};
