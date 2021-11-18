import * as React from 'react';
import { WidgetModel, WidgetModelType } from 'model';
import { Paper } from '@material-ui/core';
import { UserNavigationMobile } from 'layouts/base/navigation/UserNavigationMobile';
import { Calendar } from './calendar/Calendar';
import { Schedule } from './schedule/Schedule';
import { IFrame } from './iframe/IFrame';

import styles from './Widget.module.scss';

export interface WidgetProps {
    widget: WidgetModel;
}

export const Widget = React.memo<WidgetProps>(({ widget }) => {
    if (widget.type === WidgetModelType.UserNavigationMobile) {
        return <UserNavigationMobile />;
    }
    return (
        <Paper className={styles.root}>
            <div className={styles.heading}>{widget.title}</div>
            {widget.type === WidgetModelType.Calendar && (
                <Calendar widget={widget} />
            )}
            {widget.type === WidgetModelType.Schedule && (
                <Schedule widget={widget} />
            )}
            {widget.type === WidgetModelType.IFrame && (
                <IFrame widget={widget} />
            )}
        </Paper>
    );
});
Widget.displayName = 'Widget';
