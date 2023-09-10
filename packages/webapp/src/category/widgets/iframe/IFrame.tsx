import * as React from 'react';
import { WidgetModel, WidgetModelType } from 'model';

import styles from './IFrame.module.scss';

export interface IFrameProps {
  widget: WidgetModel<WidgetModelType.IFrame>;
}

export const IFrame = React.memo<IFrameProps>(({ widget }) => {
  return (
    <div className={styles.root}>
      <iframe title={widget.title} src={widget.configuration?.url} seamless />
    </div>
  );
});
IFrame.displayName = 'IFrameWidget';
