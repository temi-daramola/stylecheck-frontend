import { Skeleton as ChakraSkeleton, SkeletonCircle as ChakraSkeletonCircle, Stack } from '@chakra-ui/react';

export const Skeleton = (props) => <ChakraSkeleton {...props} />;
export const SkeletonCircle = (props) => <ChakraSkeletonCircle {...props} />;

export const FormSkeleton = () => (
  <Stack gap="4">
    <Skeleton height="9" />
    <Skeleton height="12" />
    <Skeleton height="12" />
    <Skeleton height="5" width="30%" />
  </Stack>
);

export const ListSkeleton = ({ rows = 3 }) => (
  <Stack gap="3">
    {Array.from({ length: rows }).map((_, index) => (
      <Skeleton key={index} height="72px" borderRadius="12px" />
    ))}
  </Stack>
);

export const CardSkeleton = () => <Skeleton height="260px" borderRadius="16px" />;
