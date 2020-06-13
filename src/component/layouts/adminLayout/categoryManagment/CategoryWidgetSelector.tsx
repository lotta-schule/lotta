import React, { memo, useCallback, useMemo } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Card, CardHeader, Checkbox, Grid, List, ListItem, ListItemIcon, ListItemText, IconButton, FormControlLabel, Typography, Switch, Divider } from '@material-ui/core';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { GetWidgetsQuery } from 'api/query/GetWidgetsQuery';
import { WidgetModel } from 'model';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { ArrowBackIosOutlined, CalendarTodayOutlined, ArrowForwardIosOutlined } from '@material-ui/icons';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            margin: 'auto',
        },
        cardHeader: {
            padding: theme.spacing(1, 2),
        },
        list: {
            height: 300,
            backgroundColor: theme.palette.background.paper,
            overflow: 'auto',
        },
        listItem: {
            padding:0,
            marginTop: theme.spacing(1),
            backgroundColor: theme.palette.grey[100],
        },
        button: {
            margin: theme.spacing(0.5, 0),
        },
        label: {
            margin: 0,
        },
        widget: {
            backgroundColor: theme.palette.grey[200],
            display: 'flex',
        }
    }),
);

export interface CategoryWidgetSelectorProps {
    selectedWidgets: WidgetModel[];
    setSelectedWidgets(widgets: WidgetModel[]): void;
}

const not = (a: WidgetModel[], b: WidgetModel[]): WidgetModel[] => a.filter(widget => b.findIndex(_b => _b.id === widget.id) === -1);

const intersection = (a: WidgetModel[], b: WidgetModel[]): WidgetModel[] => a.filter(_a => b.findIndex(_b => _b.id === _a.id) !== -1);

const union = (a: WidgetModel[], b: WidgetModel[]): WidgetModel[] => [...a, ...not(b, a)];

export const CategoryWidgetSelector = memo<CategoryWidgetSelectorProps>(({ selectedWidgets, setSelectedWidgets }) => {
    const { t } = useTranslation();
    const styles = useStyles();

    const [checkedWidgets, setCheckedWidgets] = React.useState<WidgetModel[]>([]);

    const { data, loading: isLoadingPossibleWidgets, error } = useQuery<{ widgets: WidgetModel[] }>(GetWidgetsQuery);
    const allWidgets = data ? data.widgets || [] : [];
    const possibleWidgets = useMemo(() => not(allWidgets, selectedWidgets), [allWidgets, selectedWidgets]);

    const leftChecked = intersection(checkedWidgets, possibleWidgets);
    const rightChecked = intersection(checkedWidgets, selectedWidgets);

    const handleToggle = useCallback((widget: WidgetModel) => () => {
        const currentIndex = checkedWidgets.findIndex(checkedWidget => checkedWidget.id === widget.id);
        const newChecked = [...checkedWidgets];

        if (currentIndex === -1) {
            newChecked.push(widget);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setCheckedWidgets(newChecked);
    }, [checkedWidgets]);

    const numberOfChecked = useCallback((widgets: WidgetModel[]) => intersection(checkedWidgets, widgets).length, [checkedWidgets]);

    const handleToggleAll = useCallback((widgets: WidgetModel[]) => () => {
        if (numberOfChecked(widgets) === widgets.length) {
            setCheckedWidgets(not(checkedWidgets, widgets));
        } else {
            setCheckedWidgets(union(checkedWidgets, widgets));
        }
    }, [checkedWidgets, numberOfChecked]);

    const handleCheckedRight = () => {
        setSelectedWidgets(selectedWidgets.concat(leftChecked));
        setCheckedWidgets(not(checkedWidgets, leftChecked));
    };

    const handleCheckedLeft = () => {
        setSelectedWidgets(not(selectedWidgets, rightChecked));
        setCheckedWidgets(not(checkedWidgets, rightChecked));
    };

    const listOfWidgets = useCallback((title: string, widgets: WidgetModel[]) => (
        <Card>
            <CardHeader className={styles.cardHeader}
                title={title}
                subheader={t('widgets.markedWidgets', { count: numberOfChecked(widgets), total: widgets.length })}
            >
            </CardHeader>
            <FormControlLabel className={styles.label}
                control={

                    <Checkbox
                        onClick={handleToggleAll(widgets)}
                        checked={numberOfChecked(widgets) === widgets.length && widgets.length !== 0}
                        indeterminate={numberOfChecked(widgets) !== widgets.length && numberOfChecked(widgets) !== 0}
                        disabled={widgets.length === 0}
                        inputProps={{ 'aria-label': 'all items selected' }}
                    />
                }
                label="alle auswählen"
            />
            <Divider />
            <List className={styles.list} dense component="div" role="list" data-testid="WidgetsSelectionList">
                {widgets.map((widget: WidgetModel) => {
                    const labelId = `transfer-list-all-item-${widget.id}-label`;

                    return (
                        <ListItem className={styles.listItem} key={widget.id} role="listitem" button onClick={handleToggle(widget)}>
                            <ListItemIcon>
                                <Checkbox
                                    checked={checkedWidgets.find(checkedWidget => checkedWidget.id === widget.id) !== undefined}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ 'aria-labelledby': labelId }}
                                />
                            </ListItemIcon>
                            <ListItemText id={labelId} primary={widget.title} />
                        </ListItem>
                    );
                })}
                <ListItem />
            </List>
        </Card>
        ), [checkedWidgets, handleToggle, handleToggleAll, numberOfChecked, styles.cardHeader, styles.label, styles.list, styles.listItem, t]);

    return (
        <>
            <ErrorMessage error={error} />
            <Grid container justify="center" alignItems="center" className={styles.root}>
            <Grid item xs={10} sm={5}>
                    {isLoadingPossibleWidgets ? null : listOfWidgets('Verfügbare Marginale', possibleWidgets)}
                </Grid>
                <Grid item xs={2}>
                    <Grid container direction="column" alignItems="center">
                        <IconButton
                            className={styles.button}
                            onClick={handleCheckedRight}
                            disabled={leftChecked.length === 0}
                            aria-label="Marginale wählen"
                        >
                            <ArrowForwardIosOutlined fontSize="small" />
                        </IconButton>
                        <IconButton
                            className={styles.button}
                            onClick={handleCheckedLeft}
                            disabled={rightChecked.length === 0}
                            aria-label="Marginale entfernen"
                        >
                            <ArrowBackIosOutlined fontSize="small" />
                        </IconButton>
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={5}>{listOfWidgets('Angezeigte Marginale', selectedWidgets)}</Grid>
            </Grid>
            <Grid container justify="center" alignItems="center">
                <Grid className={styles.widget} style={{marginBottom: '0.5em'}} item xs={12} sm={8}>
                    <Typography style={{margin: 'auto',}}>Alle aktivieren/deaktivieren</Typography>
                    <Switch
                                color="secondary"
                                style={{margin: 'auto',}}
                            />
                </Grid>
                <Grid className={styles.widget} item xs={12} sm={8}>
                        <CalendarTodayOutlined style={{margin: '0.5em',}} />
                        <Typography style={{margin: 'auto',}}>Terminkalender</Typography>
                        <Switch
                            color="secondary"
                            style={{margin: 'auto',}}
                        />
                </Grid>
                <Grid className={styles.widget} item xs={12} sm={8}>
                        <CalendarTodayOutlined style={{margin: '0.5em',}} />
                        <Typography style={{margin: 'auto',}}>Terminkalender</Typography>
                        <Switch
                            color="secondary"
                            style={{margin: 'auto',}}
                        />
                </Grid>
                <Grid className={styles.widget} item xs={12} sm={8}>
                        <CalendarTodayOutlined style={{margin: '0.5em',}} />
                        <Typography style={{margin: 'auto',}}>Terminkalender</Typography>
                        <Switch
                            color="secondary"
                            style={{margin: 'auto',}}
                        />
                </Grid>
            </Grid>
        </>
    );
});
