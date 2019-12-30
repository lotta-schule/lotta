import React, { FunctionComponent, memo } from 'react';
import { FileModel } from '../../../../model';
import { makeStyles, Theme } from '@material-ui/core';
import { PlaceholderImage } from 'component/placeholder/PlaceholderImage';
import Img, { ImgProps } from 'react-cloudimage-responsive';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) => ({
    clickableImage: {
        cursor: 'pointer'
    }
}));

export interface ImageContentProps extends ImgProps {
    file?: FileModel | null;
}

export const ImageContent: FunctionComponent<ImageContentProps> = memo(({ file, ...otherProps }) => {
    const styles = useStyles();
    const imageSource = file ? file.remoteLocation : null;
    return imageSource ?
        <Img src={imageSource} {...otherProps} className={clsx({ [styles.clickableImage]: !!otherProps.onClick }, otherProps.className)} /> :
        <PlaceholderImage width={'100%'} height={350} />;
});