import * as React from 'react';
import { Accordion, AccordionSummary } from '@material-ui/core';
import { WidgetModel } from 'model';
import { WidgetIcon } from 'component/widgets/WidgetIcon';
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
                <div style={{ paddingBottom: '5em' }}>
                    {widgets.map((widget) => (
                        <Accordion key={widget.id} expanded={false}>
                            <AccordionSummary
                                aria-controls={`${widget.id}-content`}
                                id={`${widget.id}-header`}
                                className={styles.expansionSummary}
                                onClick={() => onSelectWidget(widget)}
                            >
                                <div>
                                    <WidgetIcon
                                        icon={widget.configuration?.icon}
                                        size={36}
                                    />
                                    &nbsp;
                                    <span
                                        className={clsx({
                                            [styles.selected]:
                                                selectedWidget &&
                                                selectedWidget.id === widget.id,
                                        })}
                                    >
                                        {widget.title}
                                    </span>
                                </div>
                            </AccordionSummary>
                        </Accordion>
                    ))}
                </div>
            </>
        );
    }
);
WidgetNavigation.displayName = 'WidgetNavigation';
