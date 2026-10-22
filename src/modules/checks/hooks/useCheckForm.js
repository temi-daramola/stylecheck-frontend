import { createSchema, string } from '@/adapters/validation';
import { isCancelled } from '@/adapters/http';
import { useNavigation } from '@/adapters/router';
import { useForm } from '@/common/hooks';
import { ROUTES } from '@/common/constants';
import { formatErrorMessage } from '@/common/utils';
import { ChecksConstants } from '@/modules/checks/constants/ChecksConstants.js';

const { MESSAGES, CHAPTER_ITEMS, DEFAULT_CHAPTER, MAX_STUDENT_NAME_LENGTH } = ChecksConstants;

const checkSchema = createSchema({
  studentName: string({ required: MESSAGES.NAME_REQUIRED, max: [MAX_STUDENT_NAME_LENGTH, MESSAGES.NAME_TOO_LONG] }),
  chapterSection: string({ required: MESSAGES.CHAPTER_INVALID, oneOf: [CHAPTER_ITEMS.map((item) => item.value), MESSAGES.CHAPTER_INVALID] }),
});

/**
 * Student name + chapter, validated; the file and the upload machine are passed in by the controller.
 * `onPending` is called when the document was read and saved but the AI analysis failed.
 */
export const useCheckForm = ({ file, upload, onFailure, onPending }) => {
  const { goTo } = useNavigation();

  return useForm({
    initialValues: { studentName: '', chapterSection: DEFAULT_CHAPTER },
    schema: checkSchema,
    onSubmit: async (values) => {
      try {
        const response = await upload.run({ file, ...values });
        goTo(ROUTES.results(response.data.id));
      } catch (error) {
        onFailure(); // per the brief, the drop zone resets after a cancelled or failed upload
        if (isCancelled(error)) return; // a cancel is the user's choice: no error shown

        // The server saved the document's content and only the AI step failed: offer "Try again"
        // (no re-upload) instead of a dead-end error.
        const pendingCheckId = error?.data?.pendingCheckId;
        if (pendingCheckId) {
          onPending(pendingCheckId, formatErrorMessage(error, MESSAGES.CHECK_FALLBACK_ERROR), values.studentName);
          return;
        }
        throw error;
      }
    },
  });
};
