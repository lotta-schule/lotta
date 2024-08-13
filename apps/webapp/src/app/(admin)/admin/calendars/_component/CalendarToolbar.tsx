import * as React from 'react';
import { Button, ButtonGroup, Toolbar } from '@lotta-schule/hubert';
import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { ToolbarProps } from 'react-big-calendar';
import { Icon } from 'shared/Icon';
import { CreateEventDialog } from './CreateEventDialog';

import styles from './CalendarToolbar.module.scss';

export const CalendarToolbar = React.memo(
  ({ label, date, view, localizer, onNavigate }: ToolbarProps) => {
    const { t } = useTranslation();

    const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] =
      React.useState(false);

    return (
      <Toolbar hasScrollableParent className={styles.root}>
        <section>
          <ButtonGroup>
            <Button onClick={() => onNavigate('PREV')}>&lt;</Button>
            <Button onClick={() => onNavigate('TODAY')}>
              {localizer.messages.today}
            </Button>
            <Button
              onClick={() => onNavigate('NEXT')}
              title={t('Create event')}
            >
              &gt;
            </Button>
          </ButtonGroup>
        </section>
        <section>{label}</section>
        <section>
          <Button
            icon={<Icon icon={faAdd} />}
            onClick={() => setIsCreateEventDialogOpen(true)}
          />
          <CreateEventDialog
            isOpen={isCreateEventDialogOpen}
            onClose={() => setIsCreateEventDialogOpen(false)}
          />
        </section>
      </Toolbar>
    );
  }
);
CalendarToolbar.displayName = 'CalendarToolbar';
