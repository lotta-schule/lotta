import React, { memo } from 'react';
import { ScheduleWidgetConfig } from 'model';
import {
    TextField,
    makeStyles,
    Select,
    FormControl,
    InputLabel,
    MenuItem,
    FormHelperText,
} from '@material-ui/core';

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

export const ScheduleWidgetConfiguration = memo<ScheduleWidgetConfigurationProps>(
    ({ configuration, setConfiguration }) => {
        const styles = useStyles();
        return (
            <div>
                <FormControl fullWidth>
                    <InputLabel htmlFor={'schedule-type'}>Typ</InputLabel>
                    <Select
                        value={configuration.type}
                        onChange={(e) =>
                            setConfiguration({
                                ...configuration,
                                type: e.target.value as string,
                            })
                        }
                        inputProps={{
                            id: 'schedule-type',
                        }}
                    >
                        <MenuItem value={'IndiwareStudent'}>
                            Indiware - Schüler
                        </MenuItem>
                        <MenuItem value={'IndiwareTeacher'}>
                            Indiware - Lehrer
                        </MenuItem>
                    </Select>
                    <FormHelperText>Der Typ des Vertretungsplan</FormHelperText>
                </FormControl>
                <FormControl fullWidth>
                    <TextField
                        fullWidth
                        label="Schulnummer"
                        className={styles.input}
                        value={configuration.schoolId}
                        onChange={(e) =>
                            setConfiguration({
                                ...configuration,
                                schoolId: e.target.value,
                            })
                        }
                    />
                </FormControl>
                <FormControl fullWidth>
                    <TextField
                        fullWidth
                        label="Nutzername"
                        className={styles.input}
                        value={configuration.username}
                        onChange={(e) =>
                            setConfiguration({
                                ...configuration,
                                username: e.target.value,
                            })
                        }
                    />
                </FormControl>
                <FormControl fullWidth>
                    <TextField
                        fullWidth
                        label="Passwort"
                        className={styles.input}
                        value={configuration.password}
                        onChange={(e) =>
                            setConfiguration({
                                ...configuration,
                                password: e.target.value,
                            })
                        }
                    />
                </FormControl>
            </div>
        );
    }
);
