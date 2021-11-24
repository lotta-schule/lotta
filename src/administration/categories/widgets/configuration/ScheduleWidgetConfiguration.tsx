import * as React from 'react';
import { ScheduleWidgetConfig } from 'model';
import { Label } from 'shared/general/label/Label';
import { Input } from 'shared/general/form/input/Input';
import { Select } from 'shared/general/form/select/Select';

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
                    <Label label={'Typ'}>
                        <Select
                            value={configuration.type}
                            onChange={(e) =>
                                setConfiguration({
                                    ...configuration,
                                    type: e.currentTarget
                                        .value as ScheduleWidgetConfig['type'],
                                })
                            }
                            id={'schedule-type'}
                        >
                            <option value={undefined}>Typ auswählen</option>
                            <option value={'IndiwareStudent'}>
                                Indiware - Schüler
                            </option>
                            <option value={'IndiwareTeacher'}>
                                Indiware - Lehrer
                            </option>
                        </Select>
                        <small>Der Typ des Vertretungsplan</small>
                    </Label>
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
