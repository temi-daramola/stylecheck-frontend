/**
 * The three states of a supervisor's style manual:
 *  none      nothing has been uploaded
 *  uploaded  saved, but its rules have not been extracted yet (the AI step has not succeeded)
 *  ready     rules are available and checks can run
 * (A "ready" manual may also have a newer file waiting to be processed: see `manual.pending`.)
 */
export const MANUAL_STATE = Object.freeze({ NONE: 'none', UPLOADED: 'uploaded', READY: 'ready' });

export const getManualState = (manual) => {
  if (!manual) return MANUAL_STATE.NONE;
  return manual.status === 'ready' ? MANUAL_STATE.READY : MANUAL_STATE.UPLOADED;
};
