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
    GALLERY = 1,
    CAROUSEL = 2,
}

interface ConfigProps {
    contentModule: ContentModuleModel;
    onUpdateModule(contentModule: ContentModuleModel): void;
    onRequestClose(): void;
}

export const Config: FunctionComponent<ConfigProps> = memo(({ contentModule, onUpdateModule, onRequestClose }) => {

    const imageStyle: ImageStyle = get(contentModule.configuration, 'imageStyle', ImageStyle.GALLERY);
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
                    <MenuItem value={ImageStyle.GALLERY}>Galerie</MenuItem>
                    <MenuItem value={ImageStyle.CAROUSEL}>Carousel</MenuItem>
                </Select>
            </FormControl>
        </form>
    );
});