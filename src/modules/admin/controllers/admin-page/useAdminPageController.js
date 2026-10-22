import { useAuth } from '@/application';
import { useSupervisorsList, useAddSupervisorForm, useSupervisorActions } from '@/modules/admin/hooks';

export const useAdminPageController = () => {
  const { user } = useAuth();
  const list = useSupervisorsList();
  const addForm = useAddSupervisorForm();
  const actions = useSupervisorActions();

  return { currentUserId: user?.id, list, addForm, actions };
};
