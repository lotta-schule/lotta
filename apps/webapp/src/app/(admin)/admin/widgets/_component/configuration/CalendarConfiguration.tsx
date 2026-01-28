import * as React from 'react';
import { faCircleMinus } from '@fortawesome/free-solid-svg-icons';
import { Button, Input, Label, Option, Select } from '@lotta-schule/hubert';
import { useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { CalendarWidgetCalendarConfig } from 'model';
import { Icon } from 'shared/Icon';
import { GET_CALENDARS } from 'app/(admin)/admin/calendars/_graphql';

import styles from './CalendarConfiguration.module.scss';

export type CalendarConfigurationProps = {
  configuration: CalendarWidgetCalendarConfig;
  isOneOfMany?: boolean;
  onChange: (configuration: CalendarWidgetCalendarConfig) => void;
  onDelete: () => void;
};

export const CalendarConfiguration = React.memo(
  ({
    configuration,
    isOneOfMany,
    onChange,
    onDelete,
  }: CalendarConfigurationProps) => {
    const { t } = useTranslation();
    const { data, loading: isLoading } = useQuery(GET_CALENDARS);
    return (
      <div>
        <div className={styles.calendarTypeRow}>
          <Select
            title={t('Calendar Type')}
            value={configuration.type || 'external'}
            disabled={
              configuration.type !== 'internal' && data?.calendars.length === 0
            }
            onChange={(type) => {
              onChange({
                ...configuration,
                type,
              } as CalendarWidgetCalendarConfig);
            }}
          >
            <Option value="internal">{t('Lotta Calendar')}</Option>
            <Option value="external">
              {t('External Calendar (subscription in iCal format)')}
            </Option>
          </Select>
          {configuration.type === 'internal' && (
            <Select
              title={t('Calendar')}
              value={configuration.calendarId}
              disabled={isLoading}
              onChange={(calendarId) => {
                const calendar = data?.calendars.find(
                  (c) => c.id === calendarId
                );
                if (calendar) {
                  onChange({
                    ...configuration,
                    calendarId,
                    name: calendar?.name,
                    color: calendar?.color,
                  });
                }
              }}
            >
              {data?.calendars.map((calendar) => (
                <Option key={calendar.id} value={calendar.id}>
                  {calendar.name}
                </Option>
              ))}
            </Select>
          )}
        </div>
        {(!configuration.type || configuration.type === 'external') && (
          <>
            <Label label="URL des Kalenders">
              <Input
                value={configuration.url}
                onChange={(e) =>
                  onChange({
                    ...configuration,
                    url: e.currentTarget.value,
                  })
                }
              />
            </Label>
            <small className={styles.inputLegend}>
              Link zu einer *.ics-Datei
            </small>
          </>
        )}
        <Select
          fullWidth
          title={'Zeit, für die Termine abgerufen werden'}
          value={String(configuration.days ?? 90)}
          onChange={(daysString) => {
            const days = Number(daysString);
            onChange({
              ...configuration,
              days,
            });
          }}
        >
          <Option value={String(7)}>
            Termine der nächsten 7 Tage anzeigen
          </Option>
          <Option value={String(30)}>
            Termine der nächsten 30 Tage anzeigen
          </Option>
          <Option value={String(90)}>
            Termine der nächsten 3 Monate anzeigen
          </Option>
          <Option value={String(180)}>
            Termine der nächsten 6 Monate anzeigen
          </Option>
          <Option value={String(365)}>
            Termine des nächsten Jahres anzeigen
          </Option>
        </Select>
        {isOneOfMany && (
          <div className={styles.oneOfManyConfigurationRow}>
            <div>
              <Label label="Farbe">
                <Input
                  type={'color'}
                  value={configuration.color || ''}
                  onChange={(e) =>
                    onChange({
                      ...configuration,
                      color: e.currentTarget.value,
                    })
                  }
                />
              </Label>
            </div>

            <div>
              <Label label={t('calendar name')}>
                <Input
                  value={configuration.name || ''}
                  onChange={(e) =>
                    onChange({
                      ...configuration,
                      name: e.currentTarget.value,
                    })
                  }
                />
              </Label>
              <small className={styles.inputLegend}>
                Kalender einen beschreibenden Namen für die Legende zuordnen
              </small>
            </div>

            <div>
              <Button
                icon={<Icon icon={faCircleMinus} />}
                onClick={() => {
                  onDelete();
                }}
              >
                {t('remove calendar')}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
);
CalendarConfiguration.displayName = 'ExternalCalendarConfiguration';
