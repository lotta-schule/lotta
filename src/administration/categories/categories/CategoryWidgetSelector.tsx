import * as React from 'react';
import { Grid, CircularProgress } from '@material-ui/core';
import { ErrorMessage } from 'shared/general/ErrorMessage';
import { WidgetModel } from 'model';
import { useQuery } from '@apollo/client';
import { WidgetIcon } from 'category/widgets/WidgetIcon';
import { Checkbox } from 'shared/general/form/checkbox';

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
        const isAllWidgetsSelected =
            selectedWidgets.length === allWidgets.length;

        if (isLoadingPossibleWidgets) {
            return (
                <Grid container>
                    <Grid container item xs={12}>
                        <CircularProgress />
                    </Grid>
                </Grid>
            );
        }

        return (
            <>
                <ErrorMessage error={error} />

                <Grid
                    container
                    justifyContent="center"
                    alignItems="center"
                    data-testid="WidgetsSelectionList"
                >
                    {allWidgets.length > 1 && (
                        <Grid item xs={12}>
                            <Checkbox
                                isSelected={isAllWidgetsSelected}
                                onChange={() => handleToggleAll()}
                            >
                                <div className={styles.typography}>
                                    Alle Marginalen aktivieren
                                </div>
                            </Checkbox>
                        </Grid>
                    )}

                    {allWidgets.map((widget) => (
                        <Grid key={widget.id} item xs={12}>
                            <Checkbox
                                isSelected={isWidgetSelected(widget)}
                                onChange={() => handleToggle(widget)}
                            >
                                <div className={styles.typography}>
                                    <WidgetIcon
                                        icon={widget.configuration.icon}
                                        size={36}
                                    />
                                    {widget.title}
                                </div>
                            </Checkbox>
                        </Grid>
                    ))}
                </Grid>
            </>
        );
    }
);
CategoryWidgetSelector.displayName = 'CategoryWidgetSelector';
