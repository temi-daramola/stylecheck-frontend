import { useState, useRef, useCallback } from 'react';

/**
 * Imperative confirmation: `const ok = await confirm({ title, message })`.
 * Render <ConfirmDialog {...dialogProps} /> once; a destructive action's mutate function
 * is only called after the returned promise resolves true.
 */
export const useConfirm = () => {
  const [options, setOptions] = useState(null);
  const resolverRef = useRef(null);

  const settle = useCallback((result) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  const confirm = useCallback(
    (nextOptions) =>
      new Promise((resolve) => {
        resolverRef.current = resolve;
        setOptions(nextOptions);
      }),
    []
  );

  return {
    confirm,
    dialogProps: {
      open: Boolean(options),
      ...options,
      onConfirm: () => settle(true),
      onCancel: () => settle(false),
    },
  };
};
