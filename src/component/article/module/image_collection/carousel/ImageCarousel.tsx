import * as React from 'react';
import { File } from 'util/model';
import { Button, MobileStepper, Typography } from '@material-ui/core';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import { FileSorter } from '../Config';
import { ContentModuleModel, FileModel } from 'model';
import { useServerData } from 'component/ServerDataContext';
import SwipeableViews from 'react-swipeable-views';
import getConfig from 'next/config';

import styles from './ImageCarousel.module.scss';

const {
    publicRuntimeConfig: { cloudimageToken },
} = getConfig();

export interface ImageCarouselProps {
    contentModule: ContentModuleModel;
}

export const ImageCarousel = React.memo<ImageCarouselProps>(
    ({ contentModule }) => {
        const { baseUrl } = useServerData();
        const [activeStep, setActiveStep] = React.useState(0);
        const filesConfiguration: {
            [id: string]: { caption: string; sortKey: number };
        } = contentModule.configuration?.files ?? {};
        const maxSteps = contentModule.files.length;

        const handleNext = React.useCallback(() => {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }, []);

        const handleBack = React.useCallback(() => {
            setActiveStep((prevActiveStep) => prevActiveStep - 1);
        }, []);

        const handleStepChange = React.useCallback((step) => {
            setActiveStep(step);
        }, []);

        const getConfiguration = (file: FileModel) => {
            if (filesConfiguration[file.id]) {
                return {
                    // @ts-ignore
                    caption: '',
                    // @ts-ignore
                    sortKey: 0,
                    ...filesConfiguration[file.id],
                };
            } else {
                return {
                    caption: '',
                    sortKey: 0,
                };
            }
        };
        const sortedFiles = [...(contentModule.files || [])].sort(
            FileSorter(contentModule, getConfiguration)
        );

        return (
            <div className={styles.root}>
                <MobileStepper
                    className={styles.header}
                    steps={maxSteps}
                    position="static"
                    variant="text"
                    activeStep={activeStep}
                    nextButton={
                        <Button
                            size="small"
                            onClick={handleNext}
                            disabled={activeStep === maxSteps - 1}
                        >
                            Nächstes Bild
                            <KeyboardArrowRight />
                        </Button>
                    }
                    backButton={
                        <Button
                            size="small"
                            onClick={handleBack}
                            disabled={activeStep === 0}
                        >
                            <KeyboardArrowLeft />
                            Letztes Bild
                        </Button>
                    }
                />
                <SwipeableViews
                    index={activeStep}
                    onChangeIndex={handleStepChange}
                    axis={'x'}
                    enableMouseEvents
                    style={{ paddingBottom: '0.5em' }}
                >
                    {sortedFiles.map((file, index) => (
                        <div key={file.id} className={styles.imgContainer}>
                            {getConfiguration(file).caption && (
                                <Typography
                                    variant={'subtitle1'}
                                    className={styles.subtitle}
                                >
                                    {getConfiguration(file).caption}
                                </Typography>
                            )}
                            {Math.abs(activeStep - index) <= 2 ? (
                                <img
                                    src={`https://${cloudimageToken}.cloudimg.io/fit/800x500/foil1/${File.getFileRemoteLocation(
                                        baseUrl,
                                        file
                                    )}`}
                                    alt={
                                        getConfiguration(file).caption ||
                                        File.getFileRemoteLocation(
                                            baseUrl,
                                            file
                                        )
                                    }
                                />
                            ) : null}
                        </div>
                    ))}
                </SwipeableViews>
            </div>
        );
    }
);
