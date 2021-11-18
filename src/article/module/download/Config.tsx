import * as React from 'react';
import { Checkbox } from 'shared/general/form/checkbox';
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
                <Checkbox
                    label={'Vorschaubilder anzeigen'}
                    checked={!hidePreviews}
                    onChange={(e) =>
                        onUpdateModule({
                            ...contentModule,
                            configuration: {
                                ...contentModule.configuration,
                                hidePreviews: !e.currentTarget.checked,
                            },
                        })
                    }
                    name={'hidePreviews'}
                />
            </form>
        );
    }
);
Config.displayName = 'DownloadConfig';
