import * as React from 'react';
import { ScheduleWidgetConfig } from 'model';
import { makeStyles, FormControl } from '@material-ui/core';
import { Label } from 'component/general/label/Label';
import { Input } from 'component/general/form/input/Input';
import { Select } from 'component/general/form/select/Select';

export interface ScheduleWidgetConfigurationProps {
    configuration: ScheduleWidgetConfig;
    setConfiguration(configuration: ScheduleWidgetConfig): void;
}

const useStyles = makeStyles((theme) => ({
    input: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    divider: {
        marginTop: '1em',
        marginBottom: '1em',
    },
}));

export const ScheduleWidgetConfiguration = React.memo<ScheduleWidgetConfigurationProps>(
    ({ configuration, setConfiguration }) => {
        const styles = useStyles();
        return (
            <div>
                <FormControl fullWidth>
                    <Label label={'Typ'}>
                        <Select
                            value={configuration.type}
                            onChange={(e) =>
                                setConfiguration({
                                    ...configuration,
                                    type: e.currentTarget.value,
                                })
                            }
                            id={'schedule-type'}
                        >
                            <option value={'IndiwareStudent'}>
                                Indiware - Schüler
                            </option>
                            <option value={'IndiwareTeacher'}>
                                Indiware - Lehrer
                            </option>
                        </Select>
                        <small>Der Typ des Vertretungsplan</small>
                    </Label>
                </FormControl>
                <FormControl fullWidth>
                    <Label label="Schulnummer">
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
                </FormControl>
                <FormControl fullWidth>
                    <Label label="Nutzername">
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
                </FormControl>
                <FormControl fullWidth>
                    <Label label="Passwort">
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
                </FormControl>
            </div>
        );
    }
);
