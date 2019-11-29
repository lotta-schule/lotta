import React, { memo, useState } from 'react';
import { uniqBy } from 'lodash';
import { ContentModuleModel, FileModel } from 'model';
import { ImageImage } from '../../image/ImageImage';
import { Grid, makeStyles, IconButton } from '@material-ui/core';
import { SelectFileButton } from 'component/edit/SelectFileButton';
import { ImageOverlay, ImageOverlayProps } from '../imageOverlay/ImageOverlay';
import { Delete } from '@material-ui/icons';

const useStyles = makeStyles(() => ({
    img: {
        '& img': {
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
        }
    },
    deleteButton: {
        position: 'absolute',
        right: '1.5em',
        top: '.5em',
        zIndex: 1000
    }
}));

export interface GalleryProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled: boolean;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

export const Gallery = memo<GalleryProps>(({ contentModule, isEditModeEnabled, onUpdateModule }) => {
    const styles = useStyles();
    const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);

    const getConfiguration = (file: FileModel) => {
        if (contentModule.configuration && contentModule.configuration.files && contentModule.configuration.files[file.id]) {
            return {
                caption: '',
                sortKey: 0,
                ...contentModule.configuration.files[file.id]
            };
        } else {
            return {
                caption: '',
                sortKey: 0,
            };
        }
    }
    const sortedFiles = (contentModule.files || [])
        .sort((f1, f2) => getConfiguration(f1).sortKey - getConfiguration(f2).sortKey);
    return (
        <>
            <Grid container>
                {sortedFiles.map((file, index) => (
                    <Grid item xs={6} lg={4} key={file.id} style={{ position: 'relative' }}>
                        {isEditModeEnabled && (
                            <IconButton
                                color={'secondary'}
                                className={styles.deleteButton}
                                onClick={() => {
                                    onUpdateModule({
                                        ...contentModule,
                                        files: contentModule.files.filter(f => f.id !== file.id)
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
                            onUpdateFile={newFile => onUpdateModule({
                                ...contentModule,
                                files: contentModule.files.map((f, i) => i === index ? newFile : f),
                                configuration: {
                                    files: {
                                        ...contentModule.configuration.files,
                                        [newFile.id]: {
                                            caption: getConfiguration(newFile).caption,
                                            sortKey: index * 10
                                        },
                                    }
                                }
                            })}
                            onUpdateCaption={newCaption => {
                                onUpdateModule({
                                    ...contentModule,
                                    configuration: {
                                        ...contentModule.configuration,
                                        files: {
                                            ...contentModule.configuration.files,
                                            [file.id]: {
                                                ...getConfiguration(file),
                                                caption: newCaption
                                            }
                                        }
                                    }
                                });
                            }}
                            onSelect={() => setSelectedFileIndex(index)}
                            size={'350x200'}
                            width={350}
                            height={200}
                            operation={'fit'}
                            ratio={1.75}
                            className={styles.img}
                        />
                    </Grid>
                ))}
            </Grid>
            {isEditModeEnabled && (
                <SelectFileButton
                    label={'Bild hinzufügen'}
                    onSelectFiles={f => {
                        onUpdateModule({
                            ...contentModule,
                            files: uniqBy(contentModule.files.concat(f), file => file.id),
                            configuration: {
                                ...contentModule.configuration,
                                files: {
                                    ...contentModule.configuration.files,
                                    ...(f.reduce(
                                        (prev, file, i) => ({
                                            ...prev,
                                            [file.id]: {
                                                caption: '',
                                                sortKey: contentModule.files.length * 10 + i * 10
                                            }
                                        }),
                                        {}
                                    ))
                                }
                            }
                        });
                    }}
                />
            )}
            {!isEditModeEnabled && selectedFileIndex !== null && (() => {
                const prevNextProps: Partial<ImageOverlayProps> = {};
                if (selectedFileIndex > 0) {
                    prevNextProps.onPrevious = () => setSelectedFileIndex(selectedFileIndex - 1);
                }
                if (selectedFileIndex < contentModule.files.length - 1) {
                    prevNextProps.onNext = () => setSelectedFileIndex(selectedFileIndex + 1);
                }
                const selectedFile = contentModule.files[selectedFileIndex];
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
});