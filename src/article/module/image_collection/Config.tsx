import * as React from 'react';
import { ContentModuleModel, FileModel } from 'model';
import { Label } from 'shared/general/label/Label';
import { Select } from 'shared/general/form/select/Select';
import get from 'lodash/get';

import styles from '../Config.module.scss';

export enum ImageStyle {
    GALLERY = 1,
    CAROUSEL = 2,
}

export enum Sorting {
    NONE = 0,
    FILENAME_ASC = 1,
    FILENAME_DESC = 2,
    FILE_UPLOAD_DATE_ASC = 3,
    FILE_UPLOAD_DATE_DESC = 4,
}

interface ConfigProps {
    contentModule: ContentModuleModel;
    onUpdateModule(contentModule: ContentModuleModel): void;
    onRequestClose(): void;
}

export const FileSorter =
    (
        contendModule: ContentModuleModel,
        getConfiguration: (f: FileModel) => any
    ) =>
    (file1: FileModel, file2: FileModel) => {
        const sorting = get(
            contendModule.configuration,
            'sorting',
            Sorting.NONE
        );
        switch (sorting) {
            case Sorting.FILENAME_ASC:
                return file1.filename.localeCompare(file2.filename);
            case Sorting.FILENAME_DESC:
                return file2.filename.localeCompare(file1.filename);
            case Sorting.FILE_UPLOAD_DATE_ASC:
                return (
                    new Date(file1.insertedAt).getTime() -
                    new Date(file2.insertedAt).getTime()
                );
            case Sorting.FILE_UPLOAD_DATE_DESC:
                return (
                    new Date(file2.insertedAt).getTime() -
                    new Date(file1.insertedAt).getTime()
                );
            default:
                return (
                    getConfiguration(file1).sortKey -
                    getConfiguration(file2).sortKey
                );
        }
    };

export const Config = React.memo<ConfigProps>(
    ({ contentModule, onUpdateModule, onRequestClose }) => {
        const imageStyle: ImageStyle = get(
            contentModule.configuration,
            'imageStyle',
            ImageStyle.GALLERY
        );
        const sorting: Sorting = get(
            contentModule.configuration,
            'sorting',
            Sorting.NONE
        );

        return (
            <form data-testid="ImageCollectionContentModuleConfiguration">
                <Label className={styles.formControl} label={'Stil'}>
                    <Select
                        value={imageStyle}
                        onChange={(event) => {
                            onUpdateModule({
                                ...contentModule,
                                configuration: {
                                    ...contentModule.configuration,
                                    imageStyle: event.currentTarget.value,
                                },
                            });
                            onRequestClose();
                        }}
                        name={'image-style'}
                        id={'image-style'}
                    >
                        <option value={ImageStyle.GALLERY}>Galerie</option>
                        <option value={ImageStyle.CAROUSEL}>Carousel</option>
                    </Select>
                </Label>

                <Label className={styles.formControl} label={'Sortierung'}>
                    <Select
                        value={sorting}
                        onChange={(event) => {
                            onUpdateModule({
                                ...contentModule,
                                configuration: {
                                    ...contentModule.configuration,
                                    sorting: event.currentTarget.value,
                                },
                            });
                            onRequestClose();
                        }}
                        name={'sorting'}
                        id={'sorting'}
                    >
                        <option value={Sorting.NONE}>Eigene</option>
                        <option value={Sorting.FILENAME_ASC}>
                            Dateiname (aufsteigend)
                        </option>
                        <option value={Sorting.FILENAME_DESC}>
                            Dateiname (absteigend)
                        </option>
                        <option value={Sorting.FILE_UPLOAD_DATE_ASC}>
                            Hochlade-Datum (aufsteigend)
                        </option>
                        <option value={Sorting.FILE_UPLOAD_DATE_DESC}>
                            Hochlade-Datum (absteigend)
                        </option>
                    </Select>
                </Label>
            </form>
        );
    }
);
Config.displayName = 'ImageCollectionConfig';
