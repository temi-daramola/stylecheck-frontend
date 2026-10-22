import { post } from '@/adapters/http';
import { API_PATHS } from '@/common/constants';

export const loginRequest = (credentials) => post(API_PATHS.LOGIN, credentials);
export const refreshRequest = () => post(API_PATHS.REFRESH); // no params: the httpOnly cookie identifies the session
export const logoutRequest = () => post(API_PATHS.LOGOUT);
export const forgotPasswordRequest = (data) => post(API_PATHS.FORGOT_PASSWORD, data);
export const resetPasswordRequest = (data) => post(API_PATHS.RESET_PASSWORD, data);
