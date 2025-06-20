import * as React from 'react';
import { ContentModuleModel } from 'model';

type AudioAudioProps = {
  contentModule: ContentModuleModel;
};

export const AudioAudio = React.memo(({ contentModule }: AudioAudioProps) => {
  const file = contentModule.files.at(0);
  const audioFormats = React.useMemo(
    () => file?.formats?.filter((f) => f.type === 'AUDIO') ?? [],
    [file?.formats]
  );

  const validAudioFiles = React.useMemo(
    () =>
      audioFormats.filter(
        (f) =>
          !['PROCESSING', 'FAILED'].includes(f.availability.status) && !!f.url
      ),
    [audioFormats]
  );

  return (
    <audio
      controls
      style={{ height: '2em', display: 'block', width: '100%' }}
      data-testid="audio"
    >
      {validAudioFiles?.map((af) => (
        <source key={af.name} src={af.url} type={af.mimeType} />
      ))}
    </audio>
  );
});
AudioAudio.displayName = 'AudioAudio';
