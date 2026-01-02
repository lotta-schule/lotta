import React from 'react';
import { faCaretLeft, faCopy } from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  Checkbox,
  Collapse,
  DialogActions,
  DialogContent,
  ErrorMessage,
  Input,
  Label,
  LoadingButton,
  SuccessMessage,
} from '@lotta-schule/hubert';
import { Icon } from 'shared/Icon';
import { useTranslation } from 'react-i18next';
import { CALENDAR_FRAGMENT, UPDATE_CALENDAR } from '../_graphql';
import { BasicCalendarFormElement } from './BasicCalendarFormElement';
import { FragmentOf } from 'gql.tada';
import { useMutation } from '@apollo/client/react';
import { invariant } from '@epic-web/invariant';

import styles from './CalendarEditor.module.scss';

export type CalendarEditorProps = {
  calendar: FragmentOf<typeof CALENDAR_FRAGMENT>;
  onClose(): void;
};

export const CalendarEditor = React.memo(
  ({ calendar, onClose }: CalendarEditorProps) => {
    const { t } = useTranslation();
    const [updateCalendar, { error, data: result, reset }] =
      useMutation(UPDATE_CALENDAR);

    const [data, setData] = React.useState({ ...calendar });

    const close = React.useCallback(() => {
      reset();
      onClose();
    }, [onClose, reset]);

    return (
      <form>
        <DialogContent>
          <ErrorMessage error={error} />
          {calendar && (
            <>
              <BasicCalendarFormElement
                calendar={data}
                onChange={(updatedData) =>
                  setData((data) => ({ ...data, ...updatedData }))
                }
              />
              <Checkbox
                isSelected={data.isPubliclyAvailable}
                onChange={() =>
                  setData((data) => ({
                    ...data,
                    isPubliclyAvailable: !data.isPubliclyAvailable,
                  }))
                }
              >
                {t(
                  "This calender should be publicly accessible over a link. Any person knowing the link will be able to subscribe to this calendar's data."
                )}
              </Checkbox>
              <Collapse isOpen={data.isPubliclyAvailable}>
                {calendar.subscriptionUrl && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Label label={t('public link')} style={{ flex: '1 1' }}>
                        <Input
                          readOnly
                          value={calendar.subscriptionUrl}
                          onFocus={(e) => {
                            e.currentTarget.select();
                          }}
                        />
                      </Label>
                      <Button
                        icon={<Icon icon={faCopy} />}
                        title={t('copy link to clipboard')}
                        style={{
                          marginTop:
                            'calc(1em + calc(0.5 * var(--lotta-spacing)))',
                        }}
                        onClick={() => {
                          invariant(
                            calendar.subscriptionUrl,
                            'subscriptionUrl is missing'
                          );
                          navigator.clipboard.writeText(
                            calendar.subscriptionUrl
                          );
                        }}
                      />
                    </div>
                    <small
                      className={styles.helpText}
                      dangerouslySetInnerHTML={{
                        __html: t(
                          'This link allows you to share the calendar with others. Anyone with the link can subscribe to the calendar. Have a look at <a href="https://www.radioblau.de/erinnerung/wie-abonniere-ich-erinnerungen-im-kalender/" target="_blank" rel="noopener noreferrer">Wie abonniere ich Erinnerungen im Kalender?</a> to see how to subscribe to a calendar.'
                        ),
                      }}
                    />
                  </>
                )}
                {!calendar.subscriptionUrl && (
                  <SuccessMessage
                    message={t('Save the calendar to make the link available')}
                  />
                )}
              </Collapse>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button icon={<Icon icon={faCaretLeft} />} onClick={close}>
            {t('back')}
          </Button>

          <LoadingButton
            type="submit"
            style={{ marginLeft: 'auto' }}
            onAction={async (e: React.MouseEvent<any> | SubmitEvent) => {
              e.preventDefault();
              await updateCalendar({
                variables: {
                  id: calendar.id,
                  data: {
                    name: data.name,
                    color: data.color,
                    isPubliclyAvailable: data.isPubliclyAvailable,
                  },
                },
              });
            }}
            onComplete={() => {
              // If the calendar just got a subscriptionUrl, keep the dialog open. Otherwise, close it.
              if (
                !result?.calendar.subscriptionUrl ||
                calendar.subscriptionUrl
              ) {
                close();
              }
            }}
          >
            {t('save')}
          </LoadingButton>
        </DialogActions>
      </form>
    );
  }
);
CalendarEditor.displayName = 'CalendarEditor';
