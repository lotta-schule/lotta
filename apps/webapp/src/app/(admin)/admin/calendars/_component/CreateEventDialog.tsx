import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Label,
  Input,
  Button,
  Checkbox,
  Select,
  Option,
  Collapse,
} from '@lotta-schule/hubert';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client';

import GetCalendarsQuery from 'api/query/GetCalendarsQuery.graphql';

export type CreateEventDialogProps = {
  isOpen: boolean;
  onClose(): void;
};

export const CreateEventDialog = React.memo(
  ({ isOpen, onClose }: CreateEventDialogProps) => {
    const { t } = useTranslation();
    const isLoading = false;
    const [isAllDay, setIsAllDay] = React.useState(false);

    const { data } = useQuery(GetCalendarsQuery, {
      ssr: false,
      fetchPolicy: 'cache-first',
    });

    return (
      <Dialog open={isOpen} onRequestClose={onClose} title={t('Create event')}>
        <form>
          <DialogContent>
            <Label label={t('name')}>
              <Input autoFocus={isOpen} id="name" disabled={isLoading} />
            </Label>
            <Label label={t('description')}>
              <Input multiline id="description" disabled={isLoading} />
            </Label>
            <div style={{ display: 'flex' }}>
              <Select title={t('calendar')} value={''} onChange={() => {}}>
                {data?.calendars.map((calendar: any) => (
                  <Option key={calendar.id} value={calendar.id}>
                    {calendar.name}
                  </Option>
                ))}
              </Select>
              <Checkbox
                id="allDay"
                isDisabled={isLoading}
                isSelected={isAllDay}
                onChange={setIsAllDay}
                style={{ paddingTop: '2em' }}
              >
                {t('all-day')}
              </Checkbox>
            </div>

            <div style={{ display: 'flex' }}>
              <Label label={t('start date')} style={{ flexGrow: 1 }}>
                <Input type="startdate" disabled={isLoading} />
              </Label>
              <Label label={t('end date')} style={{ flexGrow: 1 }}>
                <Input type="enddate" id="enddate" disabled={isLoading} />
              </Label>
            </div>

            <Collapse isOpen={isAllDay}>
              <div style={{ display: 'flex' }}>
                <Label label={t('start time')} style={{ flexGrow: 1 }}>
                  <Input type="starttime" disabled={isLoading} />
                </Label>
                <Label label={t('end time')} style={{ flexGrow: 1 }}>
                  <Input type="endtime" id="endtime" disabled={isLoading} />
                </Label>
              </div>
            </Collapse>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => onClose()}>{t('close')}</Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
);
CreateEventDialog.displayName = 'CreateEventDialog';
