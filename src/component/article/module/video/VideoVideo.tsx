import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { Player, ControlBar } from 'video-react';
import find from 'lodash/find';
import { Typography } from '@material-ui/core';
import { PlaceholderImage } from 'component/placeholder/PlaceholderImage';

interface VideoVideoProps {
    contentModule: ContentModuleModel;
}

export const VideoVideo: FunctionComponent<VideoVideoProps> = memo(({ contentModule }) => {
    const file = contentModule.files && contentModule.files.length > 0 && contentModule.files[0];
    const videoFiles = file && file.fileConversions &&
        contentModule.files[0].fileConversions.filter(f => /^video/.test(f.mimeType));
    const posterFile = contentModule.files && contentModule.files.length > 0 && contentModule.files[0].fileConversions &&
        contentModule.files[0].fileConversions.length > 0 && find(contentModule.files[0].fileConversions, fc => /^storyboard/.test(fc.format));
    const posterFileLocation = posterFile && posterFile.remoteLocation;
    if (!file) {
        return (
            <PlaceholderImage
                width={'100%'}
                height={350}
                icon={'video'}
            />
        );
    }
    if (!videoFiles || !videoFiles.length) {
        return (
            <PlaceholderImage
                width={'100%'}
                height={350}
                icon={'video'}
                description={(
                    <Typography>
                        Bitte klicken Sie jetzt auf "SPEICHERN". 
                        <br /> 
                        Ihr Video wird nun umgewandelt und für verschiedene Endgeräte optimiert. Der Prozess kann einige Minuten dauern und läuft im Hintergrund. 
                        <br /> 
                        Nach dem Speichern, können Sie die Seite verlassen.
                    </Typography>
                )}
            />
        );
    }
    return (
        <Player
            playsInline
            poster={posterFileLocation || undefined}
        >
            {videoFiles.map(vf => <source key={vf.remoteLocation} src={vf.remoteLocation} type={vf.mimeType} />)}
            <ControlBar autoHide={true} />
        </Player>
    );
});