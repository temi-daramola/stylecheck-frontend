import { useDisclosure } from '@/common/hooks';

export const usePasswordVisibility = () => {
  const { isOpen, toggle } = useDisclosure(false);
  return { isVisible: isOpen, toggleVisibility: toggle };
};
