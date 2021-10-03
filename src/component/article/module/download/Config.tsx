import * as React from 'react';
import { FormControl, FormControlLabel, Checkbox } from '@material-ui/core';
import { ContentModuleModel } from 'model';
import get from 'lodash/get';

interface ConfigProps {
    contentModule: ContentModuleModel;
    onUpdateModule(contentModule: ContentModuleModel): void;
    onRequestClose(): void;
}

export const Config = React.memo<ConfigProps>(
    ({ contentModule, onUpdateModule }) => {
        const hidePreviews = get(
            contentModule.configuration,
            'hidePreviews',
            false
        );

        return (
            <form data-testid="DownloadContentModuleConfiguration">
                <FormControl fullWidth>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={!hidePreviews}
                                onChange={(_, checked) =>
                                    onUpdateModule({
                                        ...contentModule,
                                        configuration: {
                                            ...contentModule.configuration,
                                            hidePreviews: !checked,
                                        },
                                    })
                                }
                                name={'hidePreviews'}
                            />
                        }
                        label={'Vorschaubilder anzeigen'}
                    />
                </FormControl>
            </form>
        );
    }
);
Config.displayName = 'DownloadConfig';
