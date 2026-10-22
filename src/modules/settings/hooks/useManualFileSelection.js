import { useState, useCallback } from 'react';
import { extractDocumentText } from '@/adapters/document-text';
import { getManualFileType, validateManualFile, validateExtractedText } from '@/modules/settings/utils/ManualFile.js';

/**
 * Picks a style manual and extracts its text in the browser right away, so problems (wrong type,
 * too large, scanned PDF with no text layer) show immediately instead of after a failed upload.
 */
export const useManualFileSelection = () => {
  const [file, setFile] = useState(null);
  const [extracted, setExtracted] = useState(null); // { text, fileType }
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState('');

  const clear = useCallback(() => {
    setFile(null);
    setExtracted(null);
    setError('');
  }, []);

  const select = useCallback(async (picked) => {
    setError('');
    setExtracted(null);

    const problem = validateManualFile(picked);
    if (problem) {
      setFile(null);
      setError(problem);
      return;
    }

    setFile(picked);
    setIsExtracting(true);
    try {
      const fileType = getManualFileType(picked);
      const text = await extractDocumentText(picked, fileType);
      const textProblem = validateExtractedText(text);
      if (textProblem) {
        setFile(null);
        setError(textProblem);
        return;
      }
      setExtracted({ text, fileType });
    } catch (failure) {
      setFile(null);
      setError(failure.message);
    } finally {
      setIsExtracting(false);
    }
  }, []);

  return { file, extracted, isExtracting, error, select, clear };
};
