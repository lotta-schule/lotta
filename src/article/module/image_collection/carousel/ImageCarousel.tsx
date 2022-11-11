import * as React from 'react';
import { File } from 'util/model';
import { Stepper } from '@lotta-schule/hubert';
import { FileSorter } from '../Config';
import { ContentModuleModel, FileModel } from 'model';
import { useServerData } from 'shared/ServerDataContext';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import SwipeableViews from 'react-swipeable-views';

import styles from './ImageCarousel.module.scss';

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
                <Stepper
                    currentStep={activeStep}
                    onStep={handleStepChange}
                    maxSteps={maxSteps}
                    className={styles.header}
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
                                <span className={styles.subtitle}>
                                    {getConfiguration(file).caption}
                                </span>
                            )}
                            {Math.abs(activeStep - index) <= 2 ? (
                                <ResponsiveImage
                                    width={1600}
                                    sizes={'(max-width: 600px) 100vw, 80vw'}
                                    aspectRatio={'16:9'}
                                    resize={'bound'}
                                    src={File.getFileRemoteLocation(
                                        baseUrl,
                                        file
                                    )}
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
ImageCarousel.displayName = 'ImageCarousel';
