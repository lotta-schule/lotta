import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { FormControl, Select, InputLabel, MenuItem } from '@material-ui/core';
import get from 'lodash/get';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(() => ({
    formControl: {
        width: '100%'
    }
}))

interface ConfigProps {
    contentModule: ContentModuleModel;
    onUpdateModule(contentModule: ContentModuleModel): void;
    onRequestClose(): void;
}

export const Config: FunctionComponent<ConfigProps> = memo(({ contentModule, onUpdateModule, onRequestClose }) => {

    const headingLevel: number = get(contentModule.configuration, 'level', 4);
    const styles = useStyles();

    return (
        <form>
            <FormControl className={styles.formControl}>
                <InputLabel htmlFor="heading-level">Überschrifgrößen (1-3)</InputLabel>
                <Select
                    fullWidth
                    value={headingLevel}
                    onChange={event => {
                        onUpdateModule({
                            ...contentModule,
                            configuration: {
                                ...contentModule.configuration,
                                level: event.target.value
                            }
                        });
                        onRequestClose();
                    }}
                    inputProps={{
                        name: 'heading-level',
                        id: 'heading-level',
                    }}
                >
                    <MenuItem value={4}>Überschrift groß</MenuItem>
                    <MenuItem value={5}>Überschrift mittel</MenuItem>
                    <MenuItem value={6}>Überschrift klein</MenuItem>
                </Select>
            </FormControl>
        </form>
    );
});