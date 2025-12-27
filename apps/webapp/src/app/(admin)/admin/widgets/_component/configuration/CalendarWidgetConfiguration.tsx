import * as React from 'react';
import { CalendarWidgetCalendarConfig, CalendarWidgetConfig } from 'model';
import { Button, Divider, ErrorMessage } from '@lotta-schule/hubert';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { Icon } from 'shared/Icon';
import { useTranslation } from 'react-i18next';
import { CalendarConfiguration } from './CalendarConfiguration';
import { useQuery } from '@apollo/client/react';
import { GET_CALENDARS } from 'app/(admin)/admin/calendars/_graphql';

export interface CalendarWidgetConfigurationProps {
  configuration: CalendarWidgetConfig;
  setConfiguration(configuration: CalendarWidgetConfig): void;
}

export const CalendarWidgetConfiguration = React.memo(
  ({ configuration, setConfiguration }: CalendarWidgetConfigurationProps) => {
    const { t } = useTranslation();

    const { data, loading: isLoading, error } = useQuery(GET_CALENDARS);

    const createNewCalendarConfiguration = React.useCallback(
      (calendarType?: 'external' | 'internal') => {
        if (calendarType === 'internal' && !data?.calendars.length) {
          alert('Keine Kalender Verfügbar!');
        }
        if (calendarType === 'external' || !data?.calendars.length) {
          return { type: 'external', url: '' } as const;
        }
        return {
          type: 'internal',
          calendarId: data.calendars[0].id,
          name: data.calendars[0].name,
          color: data.calendars[0].color,
        } as const;
      },
      [data]
    );

    const calendarConfigurations = React.useMemo(
      () => configuration.calendars ?? [],
      [configuration.calendars]
    );

    const updateCalendarConfiguration = React.useCallback(
      (index: number, configuration: CalendarWidgetCalendarConfig) => {
        setConfiguration({
          ...configuration,
          calendars: calendarConfigurations.map((calendar, i) =>
            i === index ? configuration : calendar
          ),
        });
      },
      [calendarConfigurations, setConfiguration]
    );

    return (
      <div data-testid={'CalendarWidgetConfiguration'}>
        <ErrorMessage error={error} />
        {calendarConfigurations.map((calendar, index) => {
          return (
            <React.Fragment key={index}>
              <CalendarConfiguration
                configuration={calendar}
                isOneOfMany={calendarConfigurations.length > 1}
                onChange={(config) => {
                  if (calendar.type !== config.type) {
                    updateCalendarConfiguration(
                      index,
                      createNewCalendarConfiguration(config.type)
                    );
                  }
                  updateCalendarConfiguration(index, config);
                }}
                onDelete={() =>
                  setConfiguration({
                    ...configuration,
                    calendars: calendarConfigurations.filter(
                      (_, i) => i !== index
                    ),
                  })
                }
              />
              {index !== (configuration?.calendars ?? []).length - 1 && (
                <Divider style={{ marginBlock: 'var(--lotta-spacing)' }} />
              )}
            </React.Fragment>
          );
        })}

        <Button
          icon={<Icon icon={faCirclePlus} />}
          disabled={isLoading}
          style={{ marginBlock: 'var(--lotta-spacing)' }}
          onClick={() =>
            setConfiguration({
              ...configuration,
              calendars: [
                ...calendarConfigurations,
                createNewCalendarConfiguration(),
              ],
            })
          }
        >
          {t('Add Calendar')}
        </Button>
      </div>
    );
  }
);
CalendarWidgetConfiguration.displayName = 'CalendarWidgetConfiguration';
