import { ChecksConstants } from '@/modules/checks/constants/ChecksConstants.js';

const { LOCK } = ChecksConstants;
const LADDER = [LOCK.MANUAL];

/**
 * Facts in, one named state out (never a boolean). The dashboard needs a style manual before
 * a check can run. The server independently enforces the same rule, so this only drives the UI.
 */
export const getDashboardLock = (facts, requires = LOCK.MANUAL) => {
  const requiredIndex = LADDER.indexOf(requires);
  for (let index = 0; index <= requiredIndex; index += 1) {
    if (!facts[LADDER[index]]) return LADDER[index];
  }
  return LOCK.NONE;
};
