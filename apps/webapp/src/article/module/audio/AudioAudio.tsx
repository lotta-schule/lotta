import * as React from 'react';
import { ContentModuleModel } from 'model';

type AudioAudioProps = {
  contentModule: ContentModuleModel;
};

export const AudioAudio = React.memo(({ contentModule }: AudioAudioProps) => {
  const file = contentModule.files.at(0);
  const audioFiles = file?.formats?.filter((f) => f.type === 'audio');
  return (
    <audio
      controls
      style={{ height: '2em', display: 'block', width: '100%' }}
      data-testid="audio"
    >
      {audioFiles?.map((af) => <source key={af.name} src={af.url} />)}
    </audio>
  );
});
AudioAudio.displayName = 'AudioAudio';
