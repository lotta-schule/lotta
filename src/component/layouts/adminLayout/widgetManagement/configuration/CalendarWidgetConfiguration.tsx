import React, { memo } from 'react';
import { CalendarWidgetConfig } from 'model';
import { TextField, Button, Divider, makeStyles } from '@material-ui/core';

export interface CalendarWidgetConfigurationProps {
    configuration: CalendarWidgetConfig;
    setConfiguration(configuration: CalendarWidgetConfig): void;
}

const useStyles = makeStyles(theme => ({
    input: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3)
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