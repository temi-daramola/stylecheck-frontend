import { Input, Box } from '@/common/components';
import { COLORS } from '@/common/constants';
import { LockIcon, ShowIcon, HideIcon } from '@/adapters/icons';

export const PasswordInput = ({ isVisible, onToggleVisibility, ...props }) => (
  <Input
    type={isVisible ? 'text' : 'password'}
    startElement={<LockIcon size={18} />}
    endElement={
      <Box as="button" type="button" aria-label={isVisible ? 'Hide password' : 'Show password'} onClick={onToggleVisibility} cursor="pointer" color={COLORS.body.muted} display="flex">
        {isVisible ? <HideIcon size={18} /> : <ShowIcon size={18} />}
      </Box>
    }
    {...props}
  />
);
