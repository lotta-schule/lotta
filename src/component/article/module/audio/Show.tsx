import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';

interface ShowProps {
    contentModule: ContentModuleModel;
}

export const Show: FunctionComponent<ShowProps> = memo(({ contentModule }) => {
    const audioFiles = contentModule.files && contentModule.files.length > 0 && contentModule.files[0].fileConversions &&
        contentModule.files[0].fileConversions.filter(f => /^audio/.test(f.mimeType));
    return (
        <audio controls style={{ height: '2em', display: 'block', width: '100%' }}>
            {(audioFiles || []).map(af => <source src={af.remoteLocation} type={af.mimeType} />)}
        </audio>
    );
});