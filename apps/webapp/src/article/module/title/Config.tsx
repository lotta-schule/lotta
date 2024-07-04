import * as React from 'react';
import { ContentModuleModel } from 'model';
import { Option, Select } from '@lotta-schule/hubert';

const DEFAULT_LEVEL = 4;

interface ConfigProps {
  contentModule: ContentModuleModel;
  onUpdateModule(contentModule: ContentModuleModel): void;
}

export const Config = React.memo<ConfigProps>(
  ({ contentModule, onUpdateModule }) => {
    const headingLevel = contentModule.configuration?.level ?? DEFAULT_LEVEL;

    return (
      <form data-testid="TitleContentModuleConfiguration">
        <Select
          title={'Überschrifgrößen (1-3)'}
          value={String(headingLevel)}
          onChange={(newLevelString) => {
            const newLevel = Number(newLevelString);
            onUpdateModule({
              ...contentModule,
              configuration: {
                ...contentModule.configuration,
                level: isNaN(newLevel) ? DEFAULT_LEVEL : newLevel,
              },
            });
          }}
        >
          <Option value={'4'}>Überschrift groß</Option>
          <Option value={'5'}>Überschrift mittel</Option>
          <Option value={'6'}>Überschrift klein</Option>
        </Select>
      </form>
    );
  }
);
Config.displayName = 'TitleConfig';
