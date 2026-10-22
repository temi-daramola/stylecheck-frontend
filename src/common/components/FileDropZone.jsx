import { useRef, useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { COLORS } from '@/common/constants';
import { UploadCloudIcon, DocumentIcon, CloseIcon } from '@/adapters/icons';
import { Text } from './Typography';
import { formatBytes } from '@/common/utils';

/**
 * Drag-and-drop / browse file picker. Controlled: the parent owns the selected `file` and decides
 * what is valid (the zone only reports the chosen File through `onFileSelected`).
 */
export const FileDropZone = ({
  file,
  onFileSelected,
  onClear,
  accept,
  title,
  helper,
  badge,
  disabled = false,
  compact = false,
}) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) onFileSelected(dropped);
  };

  const handleInputChange = (event) => {
    const picked = event.target.files?.[0];
    if (picked) onFileSelected(picked);
    event.target.value = ''; // allow picking the same file again after clearing
  };

  const borderColor = isDragging ? COLORS.primary.base : COLORS.secondary.subtle;

  return (
    <Box>
      <input ref={inputRef} type="file" accept={accept} onChange={handleInputChange} hidden data-testid="file-input" />

      {file ? (
        <Flex align="center" gap="3" p="4" borderRadius="14px" borderWidth="1px" borderColor={COLORS.secondary.subtle} bg={COLORS.stage.surface}>
          <Flex align="center" justify="center" boxSize="40px" borderRadius="10px" bg={COLORS.primary.subtle} color={COLORS.primary.base}>
            <DocumentIcon size={20} />
          </Flex>
          <Box flex="1" minWidth="0">
            <Text fontWeight="600" color={COLORS.body.heading} truncate>{file.name}</Text>
            <Text fontSize="13px" color={COLORS.body.muted}>{formatBytes(file.size)}</Text>
          </Box>
          {onClear && !disabled && (
            <Box as="button" type="button" aria-label="Remove file" onClick={onClear} cursor="pointer" color={COLORS.body.muted} _hover={{ color: COLORS.error.base }} display="flex">
              <CloseIcon size={18} />
            </Box>
          )}
        </Flex>
      ) : (
        <Flex
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          onClick={openPicker}
          onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && openPicker()}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          direction="column"
          align="center"
          justify="center"
          gap="2"
          textAlign="center"
          px="6"
          py={compact ? '8' : '14'}
          borderRadius="16px"
          borderWidth="2px"
          borderStyle="dashed"
          borderColor={borderColor}
          bg={isDragging ? COLORS.primary.subtle : COLORS.stage.surface}
          cursor={disabled ? 'not-allowed' : 'pointer'}
          opacity={disabled ? 0.6 : 1}
          transition="all 0.15s ease"
          _focusVisible={{ borderColor: COLORS.primary.base, outline: 'none' }}
        >
          <Flex align="center" justify="center" boxSize="56px" borderRadius="full" bg={COLORS.stage.base} color={COLORS.body.heading}>
            <UploadCloudIcon size={26} />
          </Flex>
          <Text fontWeight="600" color={COLORS.body.heading}>{title}</Text>
          <Text fontSize="14px" color={COLORS.body.muted}>
            {helper} <Text as="span" color={COLORS.primary.base} fontWeight="600">browse files</Text>
          </Text>
          {badge && (
            <Text fontSize="12px" color={COLORS.body.muted} px="3" py="1" borderRadius="full" borderWidth="1px" borderColor={COLORS.secondary.subtle} bg={COLORS.stage.base}>
              {badge}
            </Text>
          )}
        </Flex>
      )}
    </Box>
  );
};
