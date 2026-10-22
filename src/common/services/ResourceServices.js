// Reads used by more than one module (dashboard gate + settings), so they live here.
import { get } from '@/adapters/http';
import { API_PATHS } from '@/common/constants';

export const fetchMyManual = () => get(API_PATHS.MANUAL_ME);
export const fetchProfile = () => get(API_PATHS.PROFILE);
