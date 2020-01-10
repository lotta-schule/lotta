import React, { memo } from 'react';
import { get } from 'lodash';
import { FormControl, Select, InputLabel, MenuItem, makeStyles } from '@material-ui/core';
import { ContentModuleModel, FileModel } from 'model';

const useStyles = makeStyles(theme => ({
    formControl: {
        marginBottom: theme.spacing(1)
    }
}))

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

export const FileSorter = (contendModule: ContentModuleModel, getConfiguration: (f: FileModel) => any) => (file1: FileModel, file2: FileModel) => {
    const sorting = get(contendModule.configuration, 'sorting', Sorting.NONE);
    switch (sorting) {
        case Sorting.FILENAME_ASC:
            return file1.filename.localeCompare(file2.filename);
        case Sorting.FILENAME_DESC:
            return file2.filename.localeCompare(file1.filename);
        case Sorting.FILE_UPLOAD_DATE_ASC:
            return new Date(file1.insertedAt).getTime() - new Date(file2.insertedAt).getTime();
        case Sorting.FILE_UPLOAD_DATE_DESC:
            return new Date(file1.insertedAt).getTime() - new Date(file2.insertedAt).getTime();
        default:
            return getConfiguration(file1).sortKey - getConfiguration(file2).sortKey;
    }
};

export const Config = memo<ConfigProps>(({ contentModule, onUpdateModule, onRequestClose }) => {

    const imageStyle: ImageStyle = get(contentModule.configuration, 'imageStyle', ImageStyle.GALLERY);
    const sorting: Sorting = get(contentModule.configuration, 'sorting', Sorting.NONE);
    const styles = useStyles();

    return (
        <form>
            <FormControl fullWidth className={styles.formControl}>
                <InputLabel htmlFor="image-style">Stil</InputLabel>
                <Select
                    fullWidth
                    value={imageStyle}
                    onChange={event => {
                        onUpdateModule({
                            ...contentModule,
                            configuration: {
                                ...contentModule.configuration,
                                imageStyle: event.target.value
                            }
                        });
                        onRequestClose();
                    }}
                    inputProps={{
                        name: 'image-style',
                        id: 'image-style',
                    }}
                >
                    <MenuItem value={ImageStyle.GALLERY}>Galerie</MenuItem>
                    <MenuItem value={ImageStyle.CAROUSEL}>Carousel</MenuItem>
                </Select>
            </FormControl>

            <FormControl fullWidth className={styles.formControl}>
                <InputLabel htmlFor="sorting">Sortierung</InputLabel>
                <Select
                    fullWidth
                    value={sorting}
                    onChange={event => {
                        onUpdateModule({
                            ...contentModule,
                            configuration: {
                                ...contentModule.configuration,
                                sorting: event.target.value
                            }
                        });
                        onRequestClose();
                    }}
                    inputProps={{
                        name: 'sorting',
                        id: 'sorting',
                    }}
                >
                    <MenuItem value={Sorting.NONE}>Eigene</MenuItem>
                    <MenuItem value={Sorting.FILENAME_ASC}>Dateiname (aufsteigend)</MenuItem>
                    <MenuItem value={Sorting.FILENAME_DESC}>Dateiname (absteigend)</MenuItem>
                    <MenuItem value={Sorting.FILE_UPLOAD_DATE_ASC}>Hochlade-Datum (aufsteigend)</MenuItem>
                    <MenuItem value={Sorting.FILE_UPLOAD_DATE_DESC}>Hochlade-Datum (absteigend)</MenuItem>
                </Select>
            </FormControl>
        </form>
    );
});