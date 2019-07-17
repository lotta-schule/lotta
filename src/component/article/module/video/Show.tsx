import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { Player } from 'video-react';
import { find } from 'lodash';

interface ShowProps {
    contentModule: ContentModuleModel;
}

export const Show: FunctionComponent<ShowProps> = memo(({ contentModule }) => {
    const videoFiles = contentModule.files && contentModule.files.length > 0 && contentModule.files[0].fileConversions &&
        contentModule.files[0].fileConversions.filter(f => /^video/.test(f.mimeType));
    const posterFile = contentModule.files && contentModule.files.length > 0 && contentModule.files[0].fileConversions &&
        contentModule.files[0].fileConversions.length && find(contentModule.files[0].fileConversions, fc => /^storyboard/.test(fc.format));
    return (videoFiles && videoFiles.length ? (
        <Player
            playsInline
            poster={posterFile && posterFile.remoteLocation || undefined}
        >
            {videoFiles.map(vf => <source src={vf.remoteLocation} type={vf.mimeType} />)}
        </Player>
    ) : (
            <img style={{ width: '100%' }} src={posterFile ? posterFile.remoteLocation : 'https://placeimg.com/1024/480/people'} alt={'Platzhalterbild'} />
        ));
});