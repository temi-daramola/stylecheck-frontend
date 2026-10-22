import { Box, Text } from '@/common/components';
import { COLORS } from '@/common/constants';
import { getScoreTone } from '@/modules/checks/utils/ScoreStyles.js';

const SIZE = 220;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const MAX_SCORE = 100;

/** Circular gauge: the arc length is the score, its color is the compliance band's. */
export const ScoreGauge = ({ score }) => {
  const tone = COLORS[getScoreTone(score)].base;
  const offset = CIRCUMFERENCE * (1 - Math.min(Math.max(score, 0), MAX_SCORE) / MAX_SCORE);

  return (
    <Box position="relative" width={`${SIZE}px`} height={`${SIZE}px`} role="img" aria-label={`Compliance score ${score} out of 100`}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke={COLORS.secondary.subtle} strokeWidth={STROKE} />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={tone}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <Box position="absolute" inset="0" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Text fontSize="60px" fontWeight="800" lineHeight="1" color={COLORS.body.heading}>{score}</Text>
        <Text fontSize="15px" color={COLORS.body.muted}>out of 100</Text>
      </Box>
    </Box>
  );
};
