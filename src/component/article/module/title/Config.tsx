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

interface ConfigProps {
    contentModule: ContentModuleModel;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

export const Config: FunctionComponent<ConfigProps> = memo(({ contentModule, onUpdateModule }) => {

    const headingLevel: number = get(contentModule.configuration, 'level', 2);
    const styles = useStyles();

    return (
        <form>
            <FormControl className={styles.formControl}>
                <InputLabel htmlFor="heading-level">Überschriftenebene (1-6)</InputLabel>
                <Select
                    fullWidth
                    value={headingLevel}
                    onChange={event => onUpdateModule({
                        ...contentModule,
                        configuration: {
                            ...contentModule.configuration,
                            level: event.target.value
                        }
                    })}
                    inputProps={{
                        name: 'heading-level',
                        id: 'heading-level',
                    }}
                >
                    <MenuItem value={1}>H1</MenuItem>
                    <MenuItem value={2}>H2</MenuItem>
                    <MenuItem value={3}>H3</MenuItem>
                    <MenuItem value={4}>H4</MenuItem>
                    <MenuItem value={5}>H5</MenuItem>
                    <MenuItem value={6}>H6</MenuItem>
                </Select>
            </FormControl>
        </form>
    );
});