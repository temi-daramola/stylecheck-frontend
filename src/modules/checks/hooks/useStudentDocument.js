import { useState, useCallback } from 'react';
import { validateStudentFile } from '@/modules/checks/utils/StudentFile.js';
import { ChecksConstants } from '@/modules/checks/constants/ChecksConstants.js';

/** The student's .docx while it is being prepared for upload: the file and why it was rejected, if it was. */
export const useStudentDocument = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const select = useCallback((picked) => {
    const problem = validateStudentFile(picked);
    setError(problem ?? '');
    setFile(problem ? null : picked);
  }, []);

  const clear = useCallback(() => {
    setFile(null);
    setError('');
  }, []);

  const requireFile = useCallback(() => {
    if (file) return true;
    setError(ChecksConstants.MESSAGES.FILE_REQUIRED);
    return false;
  }, [file]);

  return { file, error, select, clear, requireFile };
};
