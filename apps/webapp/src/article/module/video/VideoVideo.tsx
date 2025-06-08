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

  const videoFiles = React.useMemo(
    () =>
      file?.formats
        ?.filter(
          (f) =>
            f.type === 'VIDEO' && !['PROCESSING', 'FAILED'].includes(f.status)
        )
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
    [file?.formats, getSourceMediaQuery]
  );

  if (!file) {
    return <PlaceholderImage height={350} icon={'video'} />;
  }

  if (!videoFiles?.length) {
    return (
      <PlaceholderImage
        height={350}
        icon={'video'}
        description={
          <div>
            Ihr Video wird nun umgewandelt und für verschiedene Endgeräte
            optimiert. Der Prozess kann einige Minuten dauern und läuft im
            Hintergrund.
            <br />
            Sie können den Beitrag nun speichern.
          </div>
        }
      />
    );
  }
  return (
    <video
      data-testid="video"
      playsInline
      controls
      poster={posterFileUrl}
      className={styles.Video}
    >
      {videoFiles.map((vf) => (
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
