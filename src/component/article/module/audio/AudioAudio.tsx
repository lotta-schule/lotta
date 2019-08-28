import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';

interface AudioAudioProps {
    contentModule: ContentModuleModel;
}

export const AudioAudio: FunctionComponent<AudioAudioProps> = memo(({ contentModule }) => {
    const file = contentModule.files && contentModule.files.length > 0 && contentModule.files[0];
    const audioFiles = file && file.fileConversions &&
        contentModule.files[0].fileConversions.filter(f => /^audio/.test(f.mimeType));
    return (
        <audio controls style={{ height: '2em', display: 'block', width: '100%' }}>
            {(audioFiles || []).map(af => <source key={af.remoteLocation} src={af.remoteLocation} type={af.mimeType} />)}
        </audio>
    );
});