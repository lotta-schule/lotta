import React, { FunctionComponent, memo, CSSProperties, MouseEvent } from 'react';
import { FileModel } from '../../../../model';
import Img from 'react-cloudimage-responsive';
import { PlaceholderImage } from 'component/placeholder/PlaceholderImage';
import { makeStyles, Theme } from '@material-ui/core';
import classNames from 'classnames';

const useStyles = makeStyles((theme: Theme) => ({
    clickableImage: {
        cursor: 'pointer'
    }
}));

interface ImageContentProps {
    file?: FileModel | null;
    style?: CSSProperties;
    className?: string;
    onClick?(e: MouseEvent<HTMLImageElement>): void;
}

export const ImageContent: FunctionComponent<ImageContentProps> = memo(({ file, ...otherProps }) => {
    const styles = useStyles();
    const imageSource = file ? file.remoteLocation : null;
    return imageSource ?
        <Img src={imageSource} {...otherProps} className={classNames({ [styles.clickableImage]: !!otherProps.onClick }, otherProps.className)} /> :
        <PlaceholderImage width={'100%'} height={350} />;
});