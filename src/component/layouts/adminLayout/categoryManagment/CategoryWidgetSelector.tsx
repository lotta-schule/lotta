import React, { memo } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Grid, FormControlLabel, Typography, Switch, CircularProgress, withStyles } from '@material-ui/core';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { GetWidgetsQuery } from 'api/query/GetWidgetsQuery';
import { WidgetModel } from 'model';
import { useQuery } from '@apollo/client';
import { WidgetIcon } from 'component/widgets/WidgetIcon';
import { grey } from '@material-ui/core/colors';
import { theme } from 'theme';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            margin: 'auto',
        },
        cardHeader: {
            padding: theme.spacing(1, 2),
        },
        button: {
            margin: theme.spacing(0.5, 0),
        },
        labelWrapper: {
            margin: 0,
            display: 'flex',
            '& $typography': { // Typography
                display: 'flex',
                alignItems: 'center',
                '& > *': {
                    display: 'inline-block'
                }
            }
        },
        typography: {},
        label: {
            flexGrow: 1,
        },
        switchBase: {
            color: theme.palette.grey[300],
        },
    }),
);

const LottaSwitch = withStyles({
    switchBase: {
      color: grey[300],
      '&$checked': {
        color: theme.palette.secondary.main,
      },
    },
    checked: {},
    track: {},
  })(Switch);

export interface CategoryWidgetSelectorProps {
    selectedWidgets: WidgetModel[];
    setSelectedWidgets(widgets: WidgetModel[]): void;
}

export const CategoryWidgetSelector = memo<CategoryWidgetSelectorProps>(({ selectedWidgets, setSelectedWidgets }) => {
    const styles = useStyles();

    const { data, loading: isLoadingPossibleWidgets, error } = useQuery<{ widgets: WidgetModel[] }>(GetWidgetsQuery);
    const allWidgets = data ? data.widgets || [] : [];

    const handleToggle = (widget: WidgetModel) =>  {
        setSelectedWidgets(
            isWidgetSelected(widget) ? selectedWidgets.filter(w => w.id !== widget.id) : [...selectedWidgets, widget]
        );
    };

    const handleToggleAll = () => {
        setSelectedWidgets(isAllWidgetsSelected ? [] : [...allWidgets]);
    };

    const isWidgetSelected = (widget: WidgetModel) => selectedWidgets.findIndex(w => w.id === widget.id) > -1;
    const isAllWidgetsSelected = selectedWidgets.length === allWidgets.length;

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

            <Grid container justify="center" alignItems="center" data-testid="WidgetsSelectionList">
                {allWidgets.length > 1 && (
                    <Grid item xs={12} >
                        <FormControlLabel
                            classes={{ root: styles.labelWrapper, label: styles.label }}
                            style={{ marginLeft: 5 }}
                            control={<LottaSwitch color={'secondary'} checked={isAllWidgetsSelected} onChange={() => handleToggleAll()} name={'select-all-widgets'} />}
                            label={(
                                <Typography component={'div'} className={styles.typography}>
                                    Alle Marginalen aktivieren
                                </Typography>
                            )}
                            labelPlacement={'start'}
                        />
                    </Grid>
                )}

                {allWidgets.map(widget => (
                    <Grid key={widget.id} item xs={12} >
                        <FormControlLabel
                            classes={{ root: styles.labelWrapper, label: styles.label }}
                            control={<LottaSwitch className={styles.switchBase} color={'secondary'} checked={isWidgetSelected(widget)} onChange={() => handleToggle(widget)} name={`widget-${widget.id}`} />}
                            label={(
                                <Typography component={'div'} className={styles.typography}>
                                    <WidgetIcon icon={widget.configuration.icon} size={36} />
                                    {widget.title}
                                </Typography>
                            )}
                            labelPlacement={'start'}
                        />

                    </Grid>
                ))}
            </Grid>
        </>
    );
});
