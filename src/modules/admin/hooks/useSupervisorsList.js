import { useFetch } from '@/adapters/query';
import { QUERY_KEYS } from '@/common/constants';
import { fetchSupervisors } from '@/modules/admin/services/AdminServices.js';

export const useSupervisorsList = () => {
  const query = useFetch(QUERY_KEYS.ADMIN_SUPERVISORS, fetchSupervisors);

  return {
    supervisors: query.data?.items ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    retry: query.refetch,
  };
};
