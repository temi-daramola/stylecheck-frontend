import { useFetch } from '@/adapters/query';
import { useRouteParams } from '@/adapters/router';
import { QUERY_KEYS } from '@/common/constants';
import { fetchCheck } from '@/modules/checks/services/CheckServices.js';

export const useCheckDetail = () => {
  const { checkId } = useRouteParams();
  const query = useFetch(QUERY_KEYS.check(checkId), () => fetchCheck(checkId));

  return {
    checkId,
    check: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    retry: query.refetch,
  };
};
