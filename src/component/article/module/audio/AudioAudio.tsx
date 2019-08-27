import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { PlaceholderImage } from 'component/placeholder/PlaceholderImage';

interface AudioAudioProps {
    contentModule: ContentModuleModel;
}

export const AudioAudio: FunctionComponent<AudioAudioProps> = memo(({ contentModule }) => {
    const file = contentModule.files && contentModule.files.length > 0 && contentModule.files[0];
    const audioFiles = file && file.fileConversions &&
        contentModule.files[0].fileConversions.filter(f => /^audio/.test(f.mimeType));
    if (!file) {
        return (
            <PlaceholderImage width={'100%'} height={350} />
        );
    }
    if (!audioFiles || !audioFiles.length) {
        return (
            <PlaceholderImage width={'100%'} height={350} icon={'video'} />
        );
    }
    return (
        <audio controls style={{ height: '2em', display: 'block', width: '100%' }}>
            {(audioFiles || []).map(af => <source src={af.remoteLocation} type={af.mimeType} />)}
        </audio>
    );
});