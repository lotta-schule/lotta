'use client';
import * as React from 'react';
import { Checkbox, ErrorMessage, LinearProgress } from '@lotta-schule/hubert';
import { WidgetModel } from 'model';
import { useQuery } from '@apollo/client/react';
import { WidgetIcon } from 'category/widgets/WidgetIcon';

import styles from './CategoryWidgetSelector.module.scss';

import GetWidgetsQuery from 'api/query/GetWidgetsQuery.graphql';

export interface CategoryWidgetSelectorProps {
  selectedWidgets: WidgetModel[];
  setSelectedWidgets(widgets: WidgetModel[]): void;
}

export const CategoryWidgetSelector = React.memo<CategoryWidgetSelectorProps>(
  ({ selectedWidgets, setSelectedWidgets }) => {
    const {
      data,
      loading: isLoadingPossibleWidgets,
      error,
    } = useQuery<{
      widgets: WidgetModel[];
    }>(GetWidgetsQuery);
    const allWidgets = data ? data.widgets || [] : [];

    const handleToggle = (widget: WidgetModel) => {
      setSelectedWidgets(
        isWidgetSelected(widget)
          ? selectedWidgets.filter((w) => w.id !== widget.id)
          : [...selectedWidgets, widget]
      );
    };

    const handleToggleAll = () => {
      setSelectedWidgets(isAllWidgetsSelected ? [] : [...allWidgets]);
    };

    const isWidgetSelected = (widget: WidgetModel) =>
      selectedWidgets.findIndex((w) => w.id === widget.id) > -1;
    const isAllWidgetsSelected = selectedWidgets.length === allWidgets.length;

    if (isLoadingPossibleWidgets) {
      return (
        <div>
          <LinearProgress
            isIndeterminate
            aria-label={'Marginalen werden geladen'}
          />
        </div>
      );
    }

    return (
      <div className={styles.root}>
        <ErrorMessage error={error} />

        <div className={styles.grid} data-testid="WidgetsSelectionList"></div>

        {allWidgets.length > 1 && (
          <Checkbox
            isSelected={isAllWidgetsSelected}
            onChange={() => handleToggleAll()}
          >
            Alle Marginalen aktivieren
          </Checkbox>
        )}

        {allWidgets.map((widget) => (
          <Checkbox
            key={widget.id}
            isSelected={isWidgetSelected(widget)}
            onChange={() => handleToggle(widget)}
          >
            <WidgetIcon icon={widget.configuration?.icon} size={36} />
            {widget.title}
          </Checkbox>
        ))}
      </div>
    );
  }
);
CategoryWidgetSelector.displayName = 'CategoryWidgetSelector';
