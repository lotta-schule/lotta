import * as React from 'react';
import { File } from 'util/model';
import { FileModel } from 'model';
import {
    ResponsiveImage,
    ResponsiveImageProps,
} from 'util/image/ResponsiveImage';
import { PlaceholderImage } from 'shared/placeholder/PlaceholderImage';
import { useServerData } from 'shared/ServerDataContext';
import clsx from 'clsx';

import styles from './ImageContent.module.scss';

export type ImageContentProps = {
    file?: FileModel | null;
    alt: string;
} & Omit<ResponsiveImageProps, 'src' | 'alt'>;

export const ImageContent = React.memo<ImageContentProps>(
    ({ file, className, ...props }) => {
        const { baseUrl } = useServerData();
        const imageSource = file
            ? File.getFileRemoteLocation(baseUrl, file)
            : null;
        return imageSource ? (
            <ResponsiveImage
                src={imageSource}
                width={1600}
                sizes={'(max-width: 960px) 100vw, 80vw'}
                {...props}
                className={clsx(
                    { [styles.clickableImage]: !!props.onClick },
                    styles.img,
                    className
                )}
            />
        ) : (
            <PlaceholderImage width={'100%'} height={350} />
        );
    }
);
ImageContent.displayName = 'ImageContent';
