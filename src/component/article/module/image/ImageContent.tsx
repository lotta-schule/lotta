import React, { FunctionComponent, memo } from 'react';
import { FileModel } from '../../../../model';
import Img from 'react-cloudimage-responsive';
import { PlaceholderImage } from 'component/placeholder/PlaceholderImage';

interface ImageContentProps {
    file?: FileModel | null;
}

export const ImageContent: FunctionComponent<ImageContentProps> = memo(({ file }) => {
    const imageSource = file ? file.remoteLocation : null;
    return imageSource ?
        <Img src={imageSource} /> :
        <PlaceholderImage width={'100%'} height={350} />;
});