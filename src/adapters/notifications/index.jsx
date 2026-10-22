import { toast, Toaster } from 'sonner';

export const notifySuccess = (message, options = {}) => toast.success(message, options);
export const notifyError = (message, options = {}) => toast.error(message, options);
export const notifyWarning = (message, options = {}) => toast.warning(message, options);
export const notifyInfo = (message, options = {}) => toast.info(message, options);
export const dismissNotification = (id) => toast.dismiss(id);

/** Mounted once at the app root; every notify* call renders through it. */
export const NotificationHost = () => <Toaster position="top-right" richColors closeButton />;
