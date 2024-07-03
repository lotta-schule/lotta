import * as React from 'react';
import { ContentModuleModel } from 'model';
import { AudioAudio } from './AudioAudio';

interface ShowProps {
  contentModule: ContentModuleModel<{ captions: string[] }>;
}

export const Show = React.memo(({ contentModule }: ShowProps) => {
  const captions = contentModule.content?.captions ?? [];

  if (!contentModule.files.length) {
    return null;
  }
  return (
    <figure>
      <AudioAudio contentModule={contentModule} />
      <figcaption style={{ textAlign: 'right' }}>{captions[0]}</figcaption>
    </figure>
  );
});
Show.displayName = 'AudioShow';
