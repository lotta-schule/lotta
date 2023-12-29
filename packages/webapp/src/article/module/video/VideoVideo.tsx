import * as React from 'react';
import { File } from 'util/model';
import { ContentModuleModel } from 'model';
import { PlaceholderImage } from 'shared/placeholder/PlaceholderImage';
import { useServerData } from 'shared/ServerDataContext';

interface VideoVideoProps {
  contentModule: ContentModuleModel;
}

export const VideoVideo = React.memo<VideoVideoProps>(({ contentModule }) => {
  const { baseUrl } = useServerData();
  const file =
    contentModule.files &&
    contentModule.files.length > 0 &&
    contentModule.files[0];
  const videoFiles =
    file &&
    file.fileConversions &&
    contentModule.files[0].fileConversions.filter((f) =>
      /^video/.test(f.mimeType)
    );
  const posterFile = contentModule.files?.[0]?.fileConversions
    ?.filter((fc) => /^image/.test(fc.mimeType))
    .sort(
      (a, b) =>
        Number(!b.mimeType.includes('gif')) -
        Number(!a.mimeType?.includes('gif'))
    )[0];

  const posterFileLocation =
    posterFile && File.getFileConversionRemoteLocation(baseUrl, posterFile);
  if (!file) {
    return <PlaceholderImage width={'100%'} height={350} icon={'video'} />;
  }
  if (!videoFiles || !videoFiles.length) {
    return (
      <PlaceholderImage
        width={'100%'}
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
      playsInline
      controls
      poster={posterFileLocation || undefined}
      style={{ width: '100%' }}
    >
      {videoFiles.map((vf) => (
        <source
          key={File.getFileConversionRemoteLocation(baseUrl, vf)}
          src={File.getFileConversionRemoteLocation(baseUrl, vf)}
          type={vf.mimeType}
        />
      ))}
    </video>
  );
});
VideoVideo.displayName = 'VideoVideo';
