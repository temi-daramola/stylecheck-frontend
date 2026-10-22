import { get, post, patch } from '@/adapters/http';
import { API_PATHS } from '@/common/constants';

export const fetchSupervisors = () => get(API_PATHS.ADMIN_SUPERVISORS);
export const createSupervisor = (data) => post(API_PATHS.ADMIN_SUPERVISORS, data);
export const resendInvite = (supervisorId) => post(API_PATHS.adminInvite(supervisorId));
export const setSupervisorActive = ({ supervisorId, isActive }) => patch(API_PATHS.adminActive(supervisorId), { isActive });
