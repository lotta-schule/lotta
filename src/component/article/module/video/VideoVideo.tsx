import * as React from 'react';
import { File } from 'util/model';
import { ContentModuleModel } from 'model';
import { Player, ControlBar } from 'video-react';
import { PlaceholderImage } from 'component/placeholder/PlaceholderImage';
import { useServerData } from 'component/ServerDataContext';
import find from 'lodash/find';

interface VideoVideoProps {
    contentModule: ContentModuleModel;
}

export const VideoVideo = React.memo<VideoVideoProps>(({ contentModule }) => {
    const { baseUrl } = useServerData();
    const file =
        contentModule.files &&
        contentModule.files.length > 0 &&
        contentModule.files[0];
    const videoFiles =
        file &&
        file.fileConversions &&
        contentModule.files[0].fileConversions.filter((f) =>
            /^video/.test(f.mimeType)
        );
    const posterFile =
        contentModule.files &&
        contentModule.files.length > 0 &&
        contentModule.files[0].fileConversions &&
        contentModule.files[0].fileConversions.length > 0 &&
        find(contentModule.files[0].fileConversions, (fc) =>
            /^storyboard/.test(fc.format)
        );
    const posterFileLocation =
        posterFile && File.getFileConversionRemoteLocation(baseUrl, posterFile);
    if (!file) {
        return <PlaceholderImage width={'100%'} height={350} icon={'video'} />;
    }
    if (!videoFiles || !videoFiles.length) {
        return (
            <PlaceholderImage
                width={'100%'}
                height={350}
                icon={'video'}
                description={
                    <div>
                        Ihr Video wird nun umgewandelt und für verschiedene
                        Endgeräte optimiert. Der Prozess kann einige Minuten
                        dauern und läuft im Hintergrund.
                        <br />
                        Sie können den Beitrag nun speichern.
                    </div>
                }
            />
        );
    }
    return (
        <Player playsInline poster={posterFileLocation || undefined}>
            {videoFiles.map((vf) => (
                <source
                    key={File.getFileConversionRemoteLocation(baseUrl, vf)}
                    src={File.getFileConversionRemoteLocation(baseUrl, vf)}
                    type={vf.mimeType}
                />
            ))}
            <ControlBar autoHide={true} />
        </Player>
    );
});
VideoVideo.displayName = 'VideoVideo';
