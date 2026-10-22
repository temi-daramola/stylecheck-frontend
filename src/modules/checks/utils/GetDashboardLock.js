import { ChecksConstants } from '@/modules/checks/constants/ChecksConstants.js';

const { LOCK } = ChecksConstants;
const LADDER = [LOCK.MANUAL, LOCK.MANUAL_READY];

/**
 * Facts in, one named state out (never a boolean): the first failing requirement wins.
 *  manual       no style manual has been uploaded
 *  manualReady  a manual is saved but its rules have not been extracted yet
 * The server independently enforces the same rules, so this only drives the UI.
 */
export const getDashboardLock = (facts, requires = LOCK.MANUAL_READY) => {
  const requiredIndex = LADDER.indexOf(requires);
  for (let index = 0; index <= requiredIndex; index += 1) {
    if (!facts[LADDER[index]]) return LADDER[index];
  }
  return LOCK.NONE;
};
