import * as React from 'react';
import { File } from 'util/model';
import { ContentModuleModel } from '../../../../model';

interface AudioAudioProps {
    contentModule: ContentModuleModel;
}

export const AudioAudio = React.memo<AudioAudioProps>(({ contentModule }) => {
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
        >
            {(audioFiles || []).map((af) => (
                <source
                    key={File.getFileConversionRemoteLocation(af)}
                    src={File.getFileConversionRemoteLocation(af)}
                    type={af.mimeType}
                />
            ))}
        </audio>
    );
});
