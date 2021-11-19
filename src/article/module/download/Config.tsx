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
                    isSelected={!hidePreviews}
                    onChange={(isSelected) =>
                        onUpdateModule({
                            ...contentModule,
                            configuration: {
                                ...contentModule.configuration,
                                hidePreviews: !isSelected,
                            },
                        })
                    }
                    name={'hidePreviews'}
                >
                    Vorschaubilder anzeigen
                </Checkbox>
            </form>
        );
    }
);
Config.displayName = 'DownloadConfig';
