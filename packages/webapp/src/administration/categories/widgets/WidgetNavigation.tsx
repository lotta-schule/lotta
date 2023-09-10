import * as React from 'react';
import { WidgetModel } from 'model';
import { WidgetIcon } from 'category/widgets/WidgetIcon';
import clsx from 'clsx';

import styles from './WidgetNavigation.module.scss';

export interface WidgetNavigationProps {
  widgets: WidgetModel[];
  selectedWidget: WidgetModel | null;
  onSelectWidget(categoryModel: WidgetModel): void;
}

export const WidgetNavigation = React.memo<WidgetNavigationProps>(
  ({ widgets, selectedWidget, onSelectWidget }) => {
    return (
      <>
        <h5 className={styles.heading}>Alle Marginalen</h5>
        <ul style={{ paddingBottom: '5em' }}>
          {widgets.map((widget) => (
            <li key={widget.id}>
              <div
                aria-controls={`${widget.id}-content`}
                id={`${widget.id}-header`}
                className={styles.expansionSummary}
                onClick={() => onSelectWidget(widget)}
              >
                <div>
                  <WidgetIcon icon={widget.configuration?.icon} size={36} />
                  &nbsp;
                  <span
                    className={clsx({
                      [styles.selected]:
                        selectedWidget && selectedWidget.id === widget.id,
                    })}
                  >
                    {widget.title}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </>
    );
  }
);
WidgetNavigation.displayName = 'WidgetNavigation';
