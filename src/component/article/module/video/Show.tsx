import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { Player, ControlBar } from 'video-react';
import { find } from 'lodash';
import { PlaceholderImage } from 'component/placeholder/PlaceholderImage';

interface ShowProps {
    contentModule: ContentModuleModel;
}

export const Show: FunctionComponent<ShowProps> = memo(({ contentModule }) => {
    const videoFiles = contentModule.files && contentModule.files.length > 0 && contentModule.files[0].fileConversions &&
        contentModule.files[0].fileConversions.filter(f => /^video/.test(f.mimeType));
    const posterFile = contentModule.files && contentModule.files.length > 0 && contentModule.files[0].fileConversions &&
        contentModule.files[0].fileConversions.length > 0 && find(contentModule.files[0].fileConversions, fc => /^storyboard/.test(fc.format));
    const posterFileLocation = posterFile && posterFile.remoteLocation;
    return (videoFiles && videoFiles.length ? (
        <Player
            playsInline
            poster={posterFileLocation || undefined}
        >
            {videoFiles.map(vf => <source src={vf.remoteLocation} type={vf.mimeType} />)}
            <ControlBar autoHide={true} />
        </Player>
    ) : (
            <PlaceholderImage width={'100%'} height={350} />
        ));
});