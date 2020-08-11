import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { Typography, makeStyles, Theme } from '@material-ui/core';
import { VideoVideo } from './VideoVideo';

interface ShowProps {
    contentModule: ContentModuleModel<{ captions: string[] }>;
}

const useStyles = makeStyles<Theme>(theme => ({
    video: {
        margin: 0,
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        [theme.breakpoints.down('xs')]: {
            padding: 0,
        }
    }
}));

export const Show: FunctionComponent<ShowProps> = memo(({ contentModule }) => {
    const captions: string[] = contentModule.content?.captions ?? [];
    const styles = useStyles();
    return (
        <figure className={styles.video}>
            <VideoVideo contentModule={contentModule} />
            <figcaption>
                <Typography variant={'subtitle2'}>{captions[0]}</Typography>
            </figcaption>
        </figure>
    );
});