import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Label } from '@lotta-schule/hubert';

export type BasicCalendarFormElementProps = {
  calendar: { name: string; color: string };
  disabled?: boolean;
  onChange(calendar: { name: string; color: string }): void;
};
export const BasicCalendarFormElement = React.memo(
  ({ calendar, disabled, onChange }: BasicCalendarFormElementProps) => {
    const { t } = useTranslation();
    return (
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
        <Label label="Kalenderfarbe" style={{ flex: '0 0 2em' }}>
          <Input
            autoFocus
            id="color"
            type="color"
            value={calendar.color}
            style={{
              height: 'calc(1.5em + calc(2* var(--lotta-spacing)))',
              padding: 'calc(0.5 * var(--lotta-spacing))',
              top: -1,
            }}
            onChange={({ currentTarget }) =>
              onChange({ ...calendar, color: currentTarget.value })
            }
            disabled={disabled}
          />
        </Label>
        <Label label="Name des Kalenders" style={{ flex: '1' }}>
          <Input
            autoFocus
            id="name"
            value={calendar.name}
            onChange={({ currentTarget }) =>
              onChange({ ...calendar, name: currentTarget.value })
            }
            disabled={disabled}
            placeholder={t('exam dates')}
          />
        </Label>
      </div>
    );
  }
);
BasicCalendarFormElement.displayName = 'BasicCalendarFormElement';
