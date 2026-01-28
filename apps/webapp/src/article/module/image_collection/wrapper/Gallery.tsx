import * as React from 'react';
import { Button, GridList, GridListItem } from '@lotta-schule/hubert';
import { Icon } from 'shared/Icon';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { ContentModuleModel, FileModel } from 'model';
import { SelectFileButton } from 'shared/edit/SelectFileButton';
import { FileSorter } from '../Config';
import { ImageImage } from '../../image/ImageImage';
import { ImageOverlay, ImageOverlayProps } from '../imageOverlay/ImageOverlay';
import uniqBy from 'lodash/uniqBy';

import styles from './Gallery.module.scss';

export interface GalleryProps {
  contentModule: ContentModuleModel;
  isEditModeEnabled: boolean;
  onUpdateModule?: (contentModule: ContentModuleModel) => void;
}

export const Gallery = React.memo<GalleryProps>(
  ({ contentModule, isEditModeEnabled, onUpdateModule }) => {
    const [selectedFileIndex, setSelectedFileIndex] = React.useState<
      number | null
    >(null);

    const getConfiguration = (file: FileModel) => {
      if (
        contentModule.configuration &&
        contentModule.configuration.files &&
        contentModule.configuration.files[file.id]
      ) {
        return {
          caption: '',
          sortKey: 0,
          ...contentModule.configuration.files[file.id],
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
      <>
        <GridList className={styles.root}>
          {sortedFiles.map((file, index) => (
            <GridListItem
              cols={1}
              key={file.id}
              style={{
                position: 'relative',
                height: '100%',
                overflow: 'inherit',
              }}
            >
              {isEditModeEnabled && onUpdateModule && (
                <Button
                  className={styles.deleteButton}
                  onClick={() => {
                    onUpdateModule({
                      ...contentModule,
                      files: contentModule.files.filter(
                        (f) => f.id !== file.id
                      ),
                    });
                  }}
                  icon={<Icon icon={faTrash} />}
                />
              )}
              <ImageImage
                lazy
                animateOnLoad
                isEditModeEnabled={isEditModeEnabled}
                file={file}
                caption={getConfiguration(file).caption}
                format="avatar"
                sizes={[250, 500]}
                onUpdateFile={(newFile) =>
                  onUpdateModule?.({
                    ...contentModule,
                    files: contentModule.files.map((f, i) =>
                      i === index ? newFile : f
                    ),
                    configuration: {
                      files: {
                        ...contentModule.configuration.files,
                        [newFile.id]: {
                          caption: getConfiguration(newFile).caption,
                          sortKey: index * 10,
                        },
                      },
                    },
                  })
                }
                onUpdateCaption={(newCaption) => {
                  onUpdateModule?.({
                    ...contentModule,
                    configuration: {
                      ...contentModule.configuration,
                      files: {
                        ...contentModule.configuration.files,
                        [file.id]: {
                          ...getConfiguration(file),
                          caption: newCaption,
                        },
                      },
                    },
                  });
                }}
                onSelect={() => setSelectedFileIndex(index)}
                className={styles.img}
              />
            </GridListItem>
          ))}

          {isEditModeEnabled && onUpdateModule && (
            <GridListItem cols={1} key="add" className={styles.addItem}>
              <SelectFileButton
                multiple
                label={'Bild hinzufügen'}
                fileFilter={(f) => f.fileType === 'IMAGE'}
                onSelect={(f: FileModel[]) => {
                  onUpdateModule({
                    ...contentModule,
                    files: uniqBy(
                      contentModule.files.concat(f),
                      (file) => file.id
                    ),
                    configuration: {
                      ...contentModule.configuration,
                      files: {
                        ...contentModule.configuration.files,
                        ...f.reduce(
                          (prev, file, i) => ({
                            ...prev,
                            [file.id]: {
                              caption: '',
                              sortKey: contentModule.files.length * 10 + i * 10,
                            },
                          }),
                          {}
                        ),
                      },
                    },
                  });
                }}
              />
            </GridListItem>
          )}
        </GridList>
        {!isEditModeEnabled &&
          selectedFileIndex !== null &&
          (() => {
            const prevNextProps: Partial<ImageOverlayProps> = {};
            if (selectedFileIndex > 0) {
              prevNextProps.onPrevious = () =>
                setSelectedFileIndex(selectedFileIndex - 1);
            }
            if (selectedFileIndex < sortedFiles.length - 1) {
              prevNextProps.onNext = () =>
                setSelectedFileIndex(selectedFileIndex + 1);
            }
            const selectedFile = sortedFiles[selectedFileIndex];
            return (
              <ImageOverlay
                selectedFile={selectedFile}
                caption={selectedFile && getConfiguration(selectedFile).caption}
                onClose={() => setSelectedFileIndex(null)}
                {...prevNextProps}
              />
            );
          })()}
      </>
    );
  }
);
Gallery.displayName = 'Gallery';
