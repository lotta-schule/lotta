import * as React from 'react';
import { ContentModuleModel } from '../../../model';
import { FormControl, Select, InputLabel, MenuItem } from '@material-ui/core';
import get from 'lodash/get';

interface ConfigProps {
    contentModule: ContentModuleModel;
    onUpdateModule(contentModule: ContentModuleModel): void;
    onRequestClose(): void;
}

export const Config = React.memo<ConfigProps>(
    ({ contentModule, onUpdateModule, onRequestClose }) => {
        const headingLevel = get<number>(
            contentModule.configuration,
            'level',
            4
        );

        return (
            <form data-testid="TitleContentModuleConfiguration">
                <FormControl fullWidth>
                    <InputLabel htmlFor="heading-level">
                        Überschrifgrößen (1-3)
                    </InputLabel>
                    <Select
                        fullWidth
                        value={headingLevel}
                        onChange={(event) => {
                            onUpdateModule({
                                ...contentModule,
                                configuration: {
                                    ...contentModule.configuration,
                                    level: event.target.value,
                                },
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
    }
);
Config.displayName = 'TitleConfig';
