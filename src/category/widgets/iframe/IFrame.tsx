import * as React from 'react';
import { IFrameWidgetConfig, WidgetModel } from 'model';

import styles from './IFrame.module.scss';

export interface IFrameProps {
    widget: WidgetModel<IFrameWidgetConfig>;
}

export const IFrame = React.memo<IFrameProps>(({ widget }) => {
    return (
        <div className={styles.root}>
            <iframe
                title={widget.title}
                src={widget.configuration.url}
                seamless
            />
        </div>
    );
});
IFrame.displayName = 'IFrameWidget';
