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
    subtitle: {
        position: 'absolute',
        width: 'auto',
        zIndex: 1,
        background: '#fff',
        right: 0,
        bottom: 0,
        padding: '0 .5em',
    }
}));

export interface ImageCarousel {
    files: FileModel[];
    captions: (string | null)[];
}

export const ImageCarousel: FunctionComponent<ImageCarousel> = memo(({ files, captions }) => {
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
                {files.map((file, index) => (
                    <div key={file.id} style={{ textAlign: 'center' }}>
                        {captions[activeStep] && (
                            <Typography variant={'subtitle1'} className={styles.subtitle}>
                                {captions[activeStep]}
                            </Typography>
                        )}
                        {Math.abs(activeStep - index) <= 2 ? (
                            <img src={`https://afdptjdxen.cloudimg.io/bound/600x500/foil1/${file.remoteLocation}`} alt={''} />
                        ) : null}
                    </div>
                ))}
            </SwipeableViews>
        </div>
    );
});