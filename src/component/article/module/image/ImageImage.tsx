import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import Img from 'react-cloudimage-responsive';
import { PlaceholderImage } from 'component/placeholder/PlaceholderImage';

interface ImageImageProps {
    contentModule: ContentModuleModel;
}

export const ImageImage: FunctionComponent<ImageImageProps> = memo(({ contentModule }) => {
    const imageSource = contentModule.files && contentModule.files.length ? contentModule.files[0].remoteLocation : null;
    return (imageSource ? (
        <Img src={imageSource} />
    ) : (
            <PlaceholderImage width={'100%'} height={350} />
        ));
});