import { LinearProgress } from '@lotta-schule/hubert';

export default function Loading() {
  return (
    <div style={{ margin: '0 auto' }}>
      <LinearProgress aria-label="Seite wird geladen" />
    </div>
  );
}
