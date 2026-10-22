import { useState } from 'react';
import { useFetch } from '@/adapters/query';
import { useDisclosure } from '@/common/hooks';
import { QUERY_KEYS } from '@/common/constants';
import { formatErrorMessage, getManualState } from '@/common/utils';
import { fetchMyManual } from '@/common/services';
import { useManualFileSelection, useUploadManual, useProcessManual, usePreferences } from '@/modules/settings/hooks';
import { SettingsConstants } from '@/modules/settings/constants/SettingsConstants.js';

const { MESSAGES, NOT_SAVED_CODES } = SettingsConstants;

export const useSettingsPageController = () => {
  const manualQuery = useFetch(QUERY_KEYS.MANUAL, fetchMyManual);
  const selection = useManualFileSelection();
  const upload = useUploadManual();
  const processing = useProcessManual();
  const preferences = usePreferences();
  const rulesList = useDisclosure(false);

  const [uploadError, setUploadError] = useState('');
  const [processError, setProcessError] = useState('');
  const [banner, setBanner] = useState('');

  const resetFeedback = () => {
    setUploadError('');
    setProcessError('');
    setBanner('');
  };

  const selectFile = (file) => {
    resetFeedback();
    return selection.select(file);
  };

  const submit = async () => {
    if (!selection.extracted || !selection.file) return;
    resetFeedback();
    try {
      await upload.mutateAsync({
        fileName: selection.file.name,
        fileType: selection.extracted.fileType,
        fileSize: selection.file.size,
        extractedText: selection.extracted.text,
      });
      selection.clear();
      setBanner(MESSAGES.UPLOAD_SUCCESS_BANNER);
    } catch (error) {
      const message = formatErrorMessage(error, MESSAGES.UPLOAD_FALLBACK_ERROR);
      if (NOT_SAVED_CODES.includes(error?.code)) {
        // Refused before saving: keep the chosen file so the user can simply try again.
        setUploadError(message);
        return;
      }
      // Saved on the server, but the AI step failed: the file need not be chosen again.
      selection.clear();
      setUploadError(`${MESSAGES.SAVED_BUT_FAILED} ${message}`);
    }
  };

  /** "Process again": the saved manual goes through the AI step again; nothing is uploaded. */
  const processSaved = async () => {
    resetFeedback();
    try {
      await processing.mutateAsync();
      setBanner(MESSAGES.PROCESS_SUCCESS_BANNER);
    } catch (error) {
      setProcessError(formatErrorMessage(error, MESSAGES.PROCESS_FALLBACK_ERROR));
    }
  };

  const manual = manualQuery.data;

  return {
    manual,
    manualState: getManualState(manual),
    manualQuery: {
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
    isProcessing: processing.isPending,
    uploadError,
    processError,
    banner,
    selectFile,
    clearFile: selection.clear,
    submit,
    processSaved,
    rulesList,
    preferences,
  };
};
