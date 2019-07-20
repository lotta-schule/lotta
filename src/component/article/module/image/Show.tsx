import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import Img from 'react-cloudimage-responsive';
import { Photo } from '@material-ui/icons';
import { PlaceholderImage } from 'component/placeholder/PlaceholderImage';

interface ShowProps {
    contentModule: ContentModuleModel;
}

export const Show: FunctionComponent<ShowProps> = memo(({ contentModule }) => {
    const imageSource = contentModule.files && contentModule.files.length ? contentModule.files[0].remoteLocation : null;
    console.log(Photo);
    return (imageSource ? (
        <Img src={imageSource} />
    ) : (
            <PlaceholderImage width={'100%'} height={350} />
        ));
});