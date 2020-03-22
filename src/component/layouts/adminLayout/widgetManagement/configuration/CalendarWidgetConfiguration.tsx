import React, { memo } from 'react';
import { CalendarWidgetConfig } from 'model';
import { TextField, Button, Divider, makeStyles, Select, MenuItem } from '@material-ui/core';

export interface CalendarWidgetConfigurationProps {
    configuration: CalendarWidgetConfig;
    setConfiguration(configuration: CalendarWidgetConfig): void;
}

const useStyles = makeStyles(theme => ({
    input: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2)
    },
    divider: {
        marginTop: '1em',
        marginBottom: '1em'
    }
}));

export const CalendarWidgetConfiguration = memo<CalendarWidgetConfigurationProps>(({ configuration, setConfiguration }) => {
    const styles = useStyles();
    return (
        <div>
            {(configuration.calendars || []).map((calendar, index) => (
                <div key={index}>
                    <TextField
                        fullWidth
                        label="URL des Kalenders"
                        helperText={'Link zu einer *.ics-Datei'}
                        className={styles.input}
                        value={calendar.url}
                        onChange={e => setConfiguration({
                            ...configuration,
                            calendars: configuration.calendars.map((cal, i) => {
                                return (i === index) ? {
                                    ...calendar,
                                    url: e.target.value
                                } : cal;
                            })
                        })}
                    />
                    <Select
                        fullWidth
                        label={'Zeit, für die Termine abgerufen werden'}
                        value={calendar.days ?? 90}
                        onChange={e => setConfiguration({
                            ...configuration,
                            calendars: configuration.calendars.map((cal, i) => {
                                return (i === index) ? {
                                    ...calendar,
                                    days: e.target.value as number
                                } : cal;
                            })
                        })}
                    >
                        <MenuItem value={7}>Termine der nächsten 7 Tage anzeigen</MenuItem>
                        <MenuItem value={30}>Termine der nächsten 30 Tage anzeigen</MenuItem>
                        <MenuItem value={90}>Termine der nächsten 3 Monate anzeigen</MenuItem>
                        <MenuItem value={180}>Termine der nächsten 6 Monate anzeigen</MenuItem>
                        <MenuItem value={365}>Termine des nächsten Jahres anzeigen</MenuItem>
                    </Select>
                    {configuration.calendars && configuration.calendars.length > 1 && (
                        <>
                            <TextField
                                fullWidth
                                label="Name des Kalenders"
                                helperText={'Kalender einen beschreibenden Namen für die Legende zuordnen'}
                                className={styles.input}
                                value={calendar.name || ''}
                                onChange={e => setConfiguration({
                                    ...configuration,
                                    calendars: configuration.calendars.map((cal, i) => {
                                        return (i === index) ? {
                                            ...calendar,
                                            name: e.target.value
                                        } : cal;
                                    })
                                })}
                            />
                            <TextField
                                fullWidth
                                type={'color'}
                                label="Farbe des Kalenders"
                                helperText={'Farbe, die dem Kalender zugeordnet wird'}
                                className={styles.input}
                                value={calendar.color || ''}
                                onChange={e => setConfiguration({
                                    ...configuration,
                                    calendars: configuration.calendars.map((cal, i) => {
                                        return (i === index) ? {
                                            ...calendar,
                                            color: e.target.value
                                        } : cal;
                                    })
                                })}
                            />
                        </>
                    )}
                    {index < (configuration.calendars || []).length - 1 && (
                        <Divider className={styles.divider} />
                    )}
                </div>
            ))}

            <Button onClick={() => setConfiguration({ ...configuration, calendars: [...(configuration.calendars || []), { url: '' }] })}>
                Kalender-URL hinzufügen
            </Button>
        </div>
    );
});