import { useFetch } from '@/adapters/query';
import { QUERY_KEYS } from '@/common/constants';
import { fetchChecks } from '@/modules/checks/services/CheckServices.js';
import { ChecksConstants } from '@/modules/checks/constants/ChecksConstants.js';

const RECENT_KEY = [...QUERY_KEYS.CHECKS, 'recent'];

export const useRecentChecks = () => {
  const query = useFetch(RECENT_KEY, () => fetchChecks({ page: 1, pageSize: ChecksConstants.RECENT_PAGE_SIZE }));

  return {
    checks: query.data?.items ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    retry: query.refetch,
  };
};
