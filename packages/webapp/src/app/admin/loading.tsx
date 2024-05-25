import { CircularProgress } from '@lotta-schule/hubert';

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div style={{ margin: '0 auto' }}>
      <CircularProgress />
    </div>
  );
}
