import { useFetch } from '@/adapters/query';
import { QUERY_KEYS } from '@/common/constants';
import { fetchMyManual } from '@/common/services';
import { getDashboardLock } from '@/modules/checks/utils/GetDashboardLock.js';

export const useManualGate = () => {
  const query = useFetch(QUERY_KEYS.MANUAL, fetchMyManual);
  const lock = getDashboardLock({ manual: Boolean(query.data) });

  return {
    lock,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    retry: query.refetch,
  };
};
