import * as React from 'react';
import { WidgetModel, WidgetModelType } from '#/model/index.js';
import { UserNavigationMobile } from '#/layout/navigation/UserNavigationMobile.js';
import { Box } from '@lotta-schule/hubert';
import { Calendar } from './calendar/Calendar.js';
import { Schedule } from './schedule/Schedule.js';
import { IFrame } from './iframe/IFrame.js';

import styles from './Widget.module.scss';

export interface WidgetProps {
  widget: WidgetModel;
}

export const Widget = React.memo<WidgetProps>(({ widget }) => {
  if (widget.type === WidgetModelType.UserNavigationMobile) {
    return <UserNavigationMobile />;
  }
  return (
    <Box className={styles.root}>
      <div className={styles.heading}>{widget.title}</div>
      {widget.type === WidgetModelType.Calendar && <Calendar widget={widget} />}
      {widget.type === WidgetModelType.Schedule && <Schedule widget={widget} />}
      {widget.type === WidgetModelType.IFrame && <IFrame widget={widget} />}
    </Box>
  );
});
Widget.displayName = 'Widget';
