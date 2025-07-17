import * as React from 'react';
import { Stepper, SwipeableViews } from '@lotta-schule/hubert';
import { ContentModuleModel, FileModel } from 'model';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import { FileSorter } from '../Config';

import styles from './ImageCarousel.module.scss';

export type ImageCarouselProps = {
  contentModule: ContentModuleModel;
};

export const ImageCarousel = React.memo(
  ({ contentModule }: ImageCarouselProps) => {
    const [activeStep, setActiveStep] = React.useState(0);
    const filesConfiguration: {
      [id: string]: { caption?: string; sortKey?: number };
    } = contentModule.configuration?.files ?? {};
    const maxSteps = contentModule.files.length;

    const handleStepChange = React.useCallback((step: number) => {
      setActiveStep(step);
    }, []);

    const getConfiguration = (file: FileModel) => {
      if (filesConfiguration[file.id]) {
        return {
          caption: '',
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
          selectedIndex={activeStep}
          onChange={handleStepChange}
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
                  lazy
                  sizes={['(min-width: 1500px) 1500px', '80vw']}
                  file={file}
                  format="present"
                  alt={getConfiguration(file).caption || ''}
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
