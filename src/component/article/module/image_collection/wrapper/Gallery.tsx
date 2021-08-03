import React, { memo, useState } from 'react';
import {
    makeStyles,
    IconButton,
    GridList,
    GridListTile,
} from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { ContentModuleModel, FileModel, FileModelType } from 'model';
import { SelectFileButton } from 'component/edit/SelectFileButton';
import { FileSorter } from '../Config';
import { ImageImage } from '../../image/ImageImage';
import { ImageOverlay, ImageOverlayProps } from '../imageOverlay/ImageOverlay';
import uniqBy from 'lodash/uniqBy';

const useStyles = makeStyles(() => ({
    img: {
        '& img': {
            maxWidth: '100%',
            objectFit: 'cover',
            height: '20vw',
        },
    },
    deleteButton: {
        position: 'absolute',
        right: '1.5em',
        top: '.5em',
        zIndex: 200,
    },
}));

export interface GalleryProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled: boolean;
    onUpdateModule?: (contentModule: ContentModuleModel) => void;
}

export const Gallery = memo<GalleryProps>(
    ({ contentModule, isEditModeEnabled, onUpdateModule }) => {
        const styles = useStyles();
        const [selectedFileIndex, setSelectedFileIndex] = useState<
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
                <GridList cols={3}>
                    {sortedFiles.map((file, index) => (
                        <GridListTile
                            cols={1}
                            key={file.id}
                            style={{ position: 'relative', height: '100%' }}
                        >
                            {isEditModeEnabled && onUpdateModule && (
                                <IconButton
                                    color={'secondary'}
                                    className={styles.deleteButton}
                                    onClick={() => {
                                        onUpdateModule({
                                            ...contentModule,
                                            files: contentModule.files.filter(
                                                (f) => f.id !== file.id
                                            ),
                                        });
                                    }}
                                >
                                    <Delete />
                                </IconButton>
                            )}
                            <ImageImage
                                isEditModeEnabled={isEditModeEnabled}
                                file={file}
                                caption={getConfiguration(file).caption}
                                onUpdateFile={(newFile) =>
                                    onUpdateModule?.({
                                        ...contentModule,
                                        files: contentModule.files.map((f, i) =>
                                            i === index ? newFile : f
                                        ),
                                        configuration: {
                                            files: {
                                                ...contentModule.configuration
                                                    .files,
                                                [newFile.id]: {
                                                    caption: getConfiguration(
                                                        newFile
                                                    ).caption,
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
                                                ...contentModule.configuration
                                                    .files,
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
                        </GridListTile>
                    ))}
                </GridList>

                {isEditModeEnabled && onUpdateModule && (
                    <SelectFileButton
                        multiple
                        label={'Bild hinzufügen'}
                        fileFilter={(f) => f.fileType === FileModelType.Image}
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
                                                    sortKey:
                                                        contentModule.files
                                                            .length *
                                                            10 +
                                                        i * 10,
                                                },
                                            }),
                                            {}
                                        ),
                                    },
                                },
                            });
                        }}
                    />
                )}
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
                                caption={
                                    selectedFile &&
                                    getConfiguration(selectedFile).caption
                                }
                                onClose={() => setSelectedFileIndex(null)}
                                {...prevNextProps}
                            />
                        );
                    })()}
            </>
        );
    }
);
