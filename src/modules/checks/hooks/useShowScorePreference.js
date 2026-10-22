import { useFetch } from '@/adapters/query';
import { QUERY_KEYS } from '@/common/constants';
import { fetchProfile } from '@/common/services';

/** Whether recent checks show the numeric score. Defaults to off until the profile has loaded. */
export const useShowScorePreference = () => {
  const { data } = useFetch(QUERY_KEYS.PROFILE, fetchProfile);
  return Boolean(data?.preferences?.showScoreOnDashboard);
};
