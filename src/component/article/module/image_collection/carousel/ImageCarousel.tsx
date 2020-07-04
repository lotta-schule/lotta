import React, { memo, useCallback } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Button, MobileStepper, Typography } from '@material-ui/core';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import { FileSorter } from '../Config';
import { ContentModuleModel, FileModel } from 'model';
import SwipeableViews from 'react-swipeable-views';

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        fontFamily: 'Muli',
        border: '1px solid #bdbdbd',
        borderRadius: theme.shape.borderRadius,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: theme.spacing(1),
        background: 'none',
        borderBottom: '1px solid #bdbdbd'
    },
    imgContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        '& img': {
            maxWidth: '100%',
            maxHeight: '100%'
        }
    },
    subtitle: {
        position: 'absolute',
        width: 'auto',
        zIndex: 1,
        background: theme.palette.primary.contrastText,
        bottom: 0,
        padding: '0 .5em',
    }
}));

export interface ImageCarousel {
    contentModule: ContentModuleModel;
}

export const ImageCarousel = memo<ImageCarousel>(({ contentModule }) => {
    const styles = useStyles();
    const theme = useTheme();
    const [activeStep, setActiveStep] = React.useState(0);
    const filesConfiguration: { [id: string]: { caption: string; sortKey: number } } = contentModule.configuration?.files ?? {};
    const maxSteps = contentModule.files.length;

    const handleNext = useCallback(() => {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
    }, []);

    const handleBack = useCallback(() => {
        setActiveStep(prevActiveStep => prevActiveStep - 1);
    }, []);

    const handleStepChange = useCallback((step) => {
        setActiveStep(step);
    }, []);

    const getConfiguration = (file: FileModel) => {
        if (filesConfiguration[file.id]) {
            return {
                // @ts-ignore
                caption: '',
                // @ts-ignore
                sortKey: 0,
                ...filesConfiguration[file.id]
            };
        } else {
            return {
                caption: '',
                sortKey: 0,
            };
        }
    }
    const sortedFiles = [...(contentModule.files || [])].sort(FileSorter(contentModule, getConfiguration));

    return (
        <div className={styles.root}>
            <MobileStepper
                className={styles.header}
                steps={maxSteps}
                position="static"
                variant="text"
                activeStep={activeStep}
                nextButton={(
                    <Button size="small" onClick={handleNext} disabled={activeStep === maxSteps - 1}>
                        Nächstes Bild
                        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                    </Button>
                )}
                backButton={(
                    <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                        Letztes Bild
                    </Button>
                )}
            />
            <SwipeableViews
                index={activeStep}
                onChangeIndex={handleStepChange}
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                enableMouseEvents
                style={{ paddingBottom: '0.5em' }}
            >
                {sortedFiles.map((file, index) => (
                    <div key={file.id} className={styles.imgContainer}>
                        {getConfiguration(file).caption && (
                            <Typography variant={'subtitle1'} className={styles.subtitle}>
                                {getConfiguration(file).caption}
                            </Typography>
                        )}
                        {Math.abs(activeStep - index) <= 2 ? (
                            <img src={`https://afdptjdxen.cloudimg.io/fit/800x500/foil1/${file.remoteLocation}`} alt={getConfiguration(file).caption || file.remoteLocation} />
                        ) : null}
                    </div>
                ))}
            </SwipeableViews>
        </div>
    );
});
