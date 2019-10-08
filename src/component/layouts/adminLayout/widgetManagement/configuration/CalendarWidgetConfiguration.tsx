import React, { memo } from 'react';
import { CalendarWidgetConfig } from 'model';
import { TextField, Button, Divider } from '@material-ui/core';

export interface CalendarWidgetConfigurationProps {
    configuration: CalendarWidgetConfig;
    setConfiguration(configuration: CalendarWidgetConfig): void;
}

export const CalendarWidgetConfiguration = memo<CalendarWidgetConfigurationProps>(({ configuration, setConfiguration }) => {
    return (
        <div>
            {(configuration.calendars || []).map((calendar, index) => (
                <div key={index}>
                    <TextField
                        fullWidth
                        label="URL des Kalenders"
                        helperText={'Link zu einer *.ics-Datei'}
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
                    {index < (configuration.calendars || []).length - 1 && (
                        <Divider style={{ marginTop: '1em', marginBottom: '1em' }} />
                    )}
                </div>
            ))}

            <Button onClick={() => setConfiguration({ ...configuration, calendars: [...(configuration.calendars || []), { url: '' }] })}>
                Kalender-URL hinzufügen
            </Button>
        </div>
    );
});