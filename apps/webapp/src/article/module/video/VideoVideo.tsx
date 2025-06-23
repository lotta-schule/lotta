import * as React from 'react';
import { ContentModuleModel } from 'model';
import { PlaceholderImage } from 'shared/placeholder/PlaceholderImage';
import styles from './VideoVideo.module.scss';

type VideoVideoProps = {
  contentModule: ContentModuleModel;
};

export const VideoVideo = React.memo(({ contentModule }: VideoVideoProps) => {
  const file = contentModule.files.at(0);

  const getSourceMediaQuery = React.useCallback((resolution: number) => {
    if (isNaN(resolution)) {
      return undefined;
    }

    if (resolution >= 1080) {
      return '(min-height: 1080px)';
    }
    if (resolution >= 720) {
      return '(min-height: 720px)';
    }
    return 'all';
  }, []);

  const posterFileUrl =
    file?.formats?.find((f) => f.name.startsWith('POSTER'))?.url ||
    file?.formats?.find((f) => f.type === 'IMAGE')?.url;

  const videoFormats = React.useMemo(
    () => file?.formats?.filter((f) => f.type === 'VIDEO') ?? [],
    [file?.formats]
  );

  const validVideoFiles = React.useMemo(
    () =>
      videoFormats
        .filter((f) => f.availability.status === 'READY')
        .map((f) => {
          const resolution = Number(
            f.name.split('_')[1].replace(/[^0-9]/g, '')
          );

          return {
            ...f,
            resolution,
            media: getSourceMediaQuery(resolution),
          };
        })
        .sort((a, b) => {
          if (a.mimeType === b.mimeType) {
            return b.resolution - a.resolution;
          }
          return b.mimeType.localeCompare(a.mimeType);
        })
        .filter((f) => f.resolution > 200),
    [videoFormats, getSourceMediaQuery]
  );

  if (!file) {
    return <PlaceholderImage height={350} icon={'video'} />;
  }

  return (
    <video
      data-testid="video"
      playsInline
      controls
      poster={posterFileUrl}
      className={styles.Video}
    >
      {validVideoFiles.map((vf) => (
        <source
          key={vf.name}
          src={vf.url}
          type={vf.mimeType}
          media={vf.media}
        />
      ))}
    </video>
  );
});
VideoVideo.displayName = 'VideoVideo';
