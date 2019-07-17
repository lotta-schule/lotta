import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import Img from 'react-cloudimage-responsive';

interface ShowProps {
    contentModule: ContentModuleModel;
}

export const Show: FunctionComponent<ShowProps> = memo(({ contentModule }) => {
    const imageSource = contentModule.files && contentModule.files.length ? contentModule.files[0].remoteLocation : null;
    return (imageSource ? (
        <Img src={imageSource} />
    ) : (
            <img style={{ width: '100%' }} src={'https://placeimg.com/1024/480/people'} alt={'Platzhalterbild'} />
        ));
});