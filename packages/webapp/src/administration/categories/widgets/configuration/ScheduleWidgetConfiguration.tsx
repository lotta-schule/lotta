import * as React from 'react';
import { ScheduleWidgetConfig } from 'model';
import { Input, Label, Option, Select } from '@lotta-schule/hubert';

import styles from './WidgetConfiguration.module.scss';

export interface ScheduleWidgetConfigurationProps {
  configuration: ScheduleWidgetConfig;
  setConfiguration(configuration: ScheduleWidgetConfig): void;
}

export const ScheduleWidgetConfiguration =
  React.memo<ScheduleWidgetConfigurationProps>(
    ({ configuration, setConfiguration }) => {
      return (
        <div data-testid={'ScheduleWidgetConfiguration'}>
          <Select
            fullWidth
            title={'Typ'}
            value={configuration.type}
            onChange={(type) =>
              setConfiguration({
                ...configuration,
                type: type as 'IndiwareStudent' | 'IndiwareTeacher',
              })
            }
            id={'schedule-type'}
          >
            <Option value={'IndiwareStudent'}>Indiware - Schüler</Option>
            <Option value={'IndiwareTeacher'}>Indiware - Lehrer</Option>
          </Select>

          <Label label={'Schulnummer'}>
            <Input
              className={styles.input}
              value={configuration.schoolId}
              onChange={(e) =>
                setConfiguration({
                  ...configuration,
                  schoolId: e.currentTarget.value,
                })
              }
            />
          </Label>
          <Label label={'Nutzername'}>
            <Input
              className={styles.input}
              value={configuration.username}
              onChange={(e) =>
                setConfiguration({
                  ...configuration,
                  username: e.currentTarget.value,
                })
              }
            />
          </Label>
          <Label label={'Passwort'}>
            <Input
              className={styles.input}
              value={configuration.password}
              onChange={(e) =>
                setConfiguration({
                  ...configuration,
                  password: e.currentTarget.value,
                })
              }
            />
          </Label>
        </div>
      );
    }
  );
ScheduleWidgetConfiguration.displayName = 'ScheduleWidgetConfiguration';
