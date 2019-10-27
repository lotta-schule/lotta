import React, { FunctionComponent, memo, useCallback } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import MobileStepper from '@material-ui/core/MobileStepper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
import { FileModel } from 'model';

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        fontFamily: 'Muli',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        height: 50,
        paddingLeft: theme.spacing(4),
        backgroundColor: theme.palette.background.default,
    },
    img: {
        height: 255,
        display: 'block',
        maxWidth: 400,
        overflow: 'hidden',
        width: '100%',
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
        right: 0,
        bottom: 0,
        padding: '0 .5em',
    }
}));

export interface ImageCarousel {
    files: FileModel[];
    filesConfiguration: { [id: number]: { caption: string; sortKey: number } };
}

export const ImageCarousel: FunctionComponent<ImageCarousel> = memo(({ files, filesConfiguration }) => {
    const styles = useStyles();
    const theme = useTheme();
    const [activeStep, setActiveStep] = React.useState(0);
    const maxSteps = files.length;

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
                caption: '',
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
    const sortedFiles = (files || [])
        .sort((f1, f2) => getConfiguration(f1).sortKey - getConfiguration(f2).sortKey);

    return (
        <div className={styles.root}>
            <MobileStepper
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
            >
                {sortedFiles.map((file, index) => (
                    <div key={file.id} className={styles.imgContainer}>
                        {getConfiguration(file).caption && (
                            <Typography variant={'subtitle1'} className={styles.subtitle}>
                                {getConfiguration(file).caption}
                            </Typography>
                        )}
                        {Math.abs(activeStep - index) <= 2 ? (
                            <img src={`https://afdptjdxen.cloudimg.io/fit/600x500/foil1/${file.remoteLocation}`} alt={getConfiguration(file).caption || file.remoteLocation} />
                        ) : null}
                    </div>
                ))}
            </SwipeableViews>
        </div>
    );
});