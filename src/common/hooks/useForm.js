import { useState } from 'react';
import { validate } from '@/adapters/validation';
import { formatErrorMessage } from '@/common/utils';

const FIX_ERRORS_MESSAGE = 'Please fix the errors below';
const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

/**
 * One unified error state (`errors` + `formError`) whether a failure came from client-side
 * validation or from the server. `onSubmit` must return a real promise and reject on failure
 * (use a mutation's `mutateAsync`, never `mutate`).
 */
export const useForm = ({ initialValues, schema, onSubmit, resetOnSuccess = false }) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const runValidation = async (currentValues) => {
    const result = await validate(schema, currentValues);
    setErrors(result.errors ?? {});
    setFormError(result.success ? '' : FIX_ERRORS_MESSAGE);
    return result.success;
  };

  const handleChange = async (field, value) => {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    // Errors do not appear until the first submit attempt; after that each change re-validates live.
    if (hasAttemptedSubmit) {
      await runValidation(nextValues);
    }
  };

  const handleSubmit = async (event) => {
    event?.preventDefault?.();
    setHasAttemptedSubmit(true);

    if (!(await runValidation(values))) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      if (resetOnSuccess) {
        setValues(initialValues);
        setErrors({});
        setFormError('');
        setHasAttemptedSubmit(false);
      }
    } catch (error) {
      // Already shaped as { status, message, data, code, requestId } by the http adapter.
      setErrors(error?.data && !Array.isArray(error.data) ? error.data : fieldErrorsFromList(error?.data));
      setFormError(formatErrorMessage(error, GENERIC_ERROR_MESSAGE));
    } finally {
      setIsSubmitting(false);
    }
  };

  return { values, errors, formError, isSubmitting, handleChange, handleSubmit };
};

// The backend reports validation failures as [{ field, message }]; turn that into a { field: message } map.
const fieldErrorsFromList = (list) =>
  Array.isArray(list)
    ? list.reduce((map, item) => (item?.field && !map[item.field] ? { ...map, [item.field]: item.message } : map), {})
    : {};
