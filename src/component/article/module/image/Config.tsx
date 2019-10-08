import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { FormControl, Select, InputLabel, MenuItem } from '@material-ui/core';
import { get } from 'lodash';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(() => ({
    formControl: {
        width: '100%'
    }
}))

export enum ImageStyle {
    SINGLE,
    GALERY,
    CAROUSEL,
}

interface ConfigProps {
    contentModule: ContentModuleModel;
    onUpdateModule(contentModule: ContentModuleModel): void;
    onRequestClose(): void;
}

export const Config: FunctionComponent<ConfigProps> = memo(({ contentModule, onUpdateModule, onRequestClose }) => {

    const imageStyle: ImageStyle = get(contentModule.configuration, 'imageStyle', ImageStyle.SINGLE);
    const styles = useStyles();

    return (
        <form>
            <FormControl className={styles.formControl}>
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
                    <MenuItem value={ImageStyle.SINGLE}>Einzelbild</MenuItem>
                    <MenuItem value={ImageStyle.GALERY}>Galerie</MenuItem>
                    <MenuItem value={ImageStyle.CAROUSEL}>Carousel</MenuItem>
                </Select>
            </FormControl>
        </form>
    );
});