import * as React from 'react';
import { ContentModuleModel } from 'model';
import { Label, Select } from '@lotta-schule/hubert';
import get from 'lodash/get';

const DEFAULT_LEVEL = 4;

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
            DEFAULT_LEVEL
        );

        return (
            <form data-testid="TitleContentModuleConfiguration">
                <Label label={'Überschrifgrößen (1-3)'}>
                    <Select
                        value={headingLevel}
                        onChange={(event) => {
                            const newLevel = Number(event.currentTarget.value);
                            onUpdateModule({
                                ...contentModule,
                                configuration: {
                                    ...contentModule.configuration,
                                    level: isNaN(newLevel)
                                        ? DEFAULT_LEVEL
                                        : newLevel,
                                },
                            });
                            onRequestClose();
                        }}
                    >
                        <option value={4}>Überschrift groß</option>
                        <option value={5}>Überschrift mittel</option>
                        <option value={6}>Überschrift klein</option>
                    </Select>
                </Label>
            </form>
        );
    }
);
Config.displayName = 'TitleConfig';
