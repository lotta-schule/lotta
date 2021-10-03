import * as React from 'react';
import { File } from 'util/model';
import { FileModel } from 'model';
import { PlaceholderImage } from 'component/placeholder/PlaceholderImage';
import { useServerData } from 'component/ServerDataContext';
import Img, { ImgProps } from 'react-cloudimage-responsive';
import clsx from 'clsx';

import styles from './ImageContent.module.scss';

export interface ImageContentProps extends ImgProps {
    file?: FileModel | null;
}

export const ImageContent = React.memo<ImageContentProps>(
    ({ file, className, ...props }) => {
        const { baseUrl } = useServerData();
        const imageSource = file
            ? File.getFileRemoteLocation(baseUrl, file)
            : null;
        return imageSource ? (
            <Img
                src={imageSource}
                {...props}
                className={clsx(
                    { [styles.clickableImage]: !!props.onClick },
                    className
                )}
            />
        ) : (
            <PlaceholderImage width={'100%'} height={350} />
        );
    }
);
ImageContent.displayName = 'ImageContent';
