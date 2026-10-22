import { useState } from 'react';
import { useFetch } from '@/adapters/query';
import { useDisclosure } from '@/common/hooks';
import { QUERY_KEYS } from '@/common/constants';
import { formatErrorMessage } from '@/common/utils';
import { fetchMyManual } from '@/common/services';
import { useManualFileSelection, useUploadManual, usePreferences } from '@/modules/settings/hooks';
import { SettingsConstants } from '@/modules/settings/constants/SettingsConstants.js';

export const useSettingsPageController = () => {
  const manualQuery = useFetch(QUERY_KEYS.MANUAL, fetchMyManual);
  const selection = useManualFileSelection();
  const upload = useUploadManual();
  const preferences = usePreferences();
  const rulesList = useDisclosure(false);

  const [uploadError, setUploadError] = useState('');
  const [justUploaded, setJustUploaded] = useState(false);

  const selectFile = (file) => {
    setJustUploaded(false);
    setUploadError('');
    return selection.select(file);
  };

  const submit = async () => {
    if (!selection.extracted || !selection.file) return;
    setUploadError('');
    try {
      await upload.mutateAsync({
        fileName: selection.file.name,
        fileType: selection.extracted.fileType,
        fileSize: selection.file.size,
        extractedText: selection.extracted.text,
      });
      selection.clear();
      setJustUploaded(true);
    } catch (error) {
      setUploadError(formatErrorMessage(error, SettingsConstants.MESSAGES.UPLOAD_FALLBACK_ERROR));
    }
  };

  return {
    manual: manualQuery.data,
    manualState: {
      isLoading: manualQuery.isLoading,
      isError: manualQuery.isError,
      error: manualQuery.error,
      retry: manualQuery.refetch,
    },
    file: selection.file,
    isExtracting: selection.isExtracting,
    selectionError: selection.error,
    canSubmit: Boolean(selection.extracted) && !selection.isExtracting,
    isUploading: upload.isPending,
    uploadError,
    justUploaded,
    selectFile,
    clearFile: selection.clear,
    submit,
    rulesList,
    preferences,
  };
};
