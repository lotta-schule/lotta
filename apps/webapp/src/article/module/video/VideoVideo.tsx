import * as React from 'react';
import { ContentModuleModel } from 'model';
import { PlaceholderImage } from 'shared/placeholder/PlaceholderImage';
import styles from './VideoVideo.module.scss';

type VideoVideoProps = {
  contentModule: ContentModuleModel;
};

export const VideoVideo = React.memo(({ contentModule }: VideoVideoProps) => {
  const file = contentModule.files.at(0);

  const posterFileUrl = file?.formats?.find((f) => f.type === 'image')?.url;
  const videoFiles = file?.formats?.filter((f) => f.type === 'video');

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
        <source key={vf.name} src={vf.url} />
      ))}
    </video>
  );
});
VideoVideo.displayName = 'VideoVideo';
