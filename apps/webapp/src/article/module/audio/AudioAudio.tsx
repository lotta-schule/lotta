import * as React from 'react';
import { ContentModuleModel } from 'model';
import { File } from 'util/model';
import { useServerData } from 'shared/ServerDataContext';

interface AudioAudioProps {
  contentModule: ContentModuleModel;
}

export const AudioAudio = React.memo<AudioAudioProps>(({ contentModule }) => {
  const { baseUrl } = useServerData();
  const file =
    contentModule.files &&
    contentModule.files.length > 0 &&
    contentModule.files[0];
  const audioFiles =
    file &&
    file.fileConversions &&
    contentModule.files[0].fileConversions.filter((f) =>
      /^audio/.test(f.mimeType)
    );
  return (
    <audio
      controls
      style={{ height: '2em', display: 'block', width: '100%' }}
      data-testid="audio"
    >
      {(audioFiles || []).map((af) => (
        <source
          key={File.getFileConversionRemoteLocation(baseUrl, af)}
          src={File.getFileConversionRemoteLocation(baseUrl, af)}
          type={af.mimeType}
        />
      ))}
    </audio>
  );
});
AudioAudio.displayName = 'AudioAudio';
