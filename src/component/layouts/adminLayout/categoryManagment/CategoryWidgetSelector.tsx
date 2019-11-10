import React, { memo, useCallback, useMemo } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import { WidgetModel } from 'model';
import { useQuery } from 'react-apollo';
import { GetWidgetsQuery } from 'api/query/GetWidgetsQuery';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            margin: 'auto',
            border: '1px solid',
            borderColor: theme.palette.grey[700]
        },
        cardHeader: {
            padding: theme.spacing(1, 2),
        },
        list: {
            width: 200,
            height: 230,
            backgroundColor: theme.palette.background.paper,
            overflow: 'auto',
        },
        button: {
            margin: theme.spacing(0.5, 0),
        },
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
    const styles = useStyles();

    const [checkedWidgets, setCheckedWidgets] = React.useState<WidgetModel[]>([]);

    const { data, loading: isLoadingPossibleWidgets, error } = useQuery<{ widgets: WidgetModel[] }>(GetWidgetsQuery);
    const allWidgets = data ? data.widgets || [] : [];
    // const [possibleWidgets, setPossibleWidgets] = React.useState<WidgetModel[]>(allWidgets);
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
        // setPossibleWidgets(not(possibleWidgets, leftChecked));
        setCheckedWidgets(not(checkedWidgets, leftChecked));
    };

    const handleCheckedLeft = () => {
        // setPossibleWidgets(possibleWidgets.concat(rightChecked));
        setSelectedWidgets(not(selectedWidgets, rightChecked));
        setCheckedWidgets(not(checkedWidgets, rightChecked));
    };

    const listOfWidgets = useCallback((title: string, widgets: WidgetModel[]) => (
        <Card>
            <CardHeader
                className={styles.cardHeader}
                avatar={
                    <Checkbox
                        onClick={handleToggleAll(widgets)}
                        checked={numberOfChecked(widgets) === widgets.length && widgets.length !== 0}
                        indeterminate={numberOfChecked(widgets) !== widgets.length && numberOfChecked(widgets) !== 0}
                        disabled={widgets.length === 0}
                        inputProps={{ 'aria-label': 'all items selected' }}
                    />
                }
                title={title}
                subheader={`${numberOfChecked(widgets)}/${widgets.length} selected`}
            />
            <Divider />
            <List className={styles.list} dense component="div" role="list">
                {widgets.map((widget: WidgetModel) => {
                    const labelId = `transfer-list-all-item-${widget.id}-label`;

                    return (
                        <ListItem key={widget.id} role="listitem" button onClick={handleToggle(widget)}>
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
    ), [checkedWidgets, handleToggle, handleToggleAll, numberOfChecked, styles.cardHeader, styles.list]);

    return (
        <>
            {error && <div style={{ color: 'red' }}>{error.message}</div>}
            <Grid container justify="center" alignItems="center" className={styles.root}>
                <Grid item>
                    {isLoadingPossibleWidgets || listOfWidgets('Mögliche Marginale', possibleWidgets)}
                </Grid>
                <Grid item>
                    <Grid container direction="column" alignItems="center">
                        <Button
                            variant="outlined"
                            size="small"
                            className={styles.button}
                            onClick={handleCheckedRight}
                            disabled={leftChecked.length === 0}
                            aria-label="Marginale wählen"
                        >
                            &gt;
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            className={styles.button}
                            onClick={handleCheckedLeft}
                            disabled={rightChecked.length === 0}
                            aria-label="Marginale entfernen"
                        >
                            &lt;
                        </Button>
                    </Grid>
                </Grid>
                <Grid item>{listOfWidgets('Gewählte Marginale', selectedWidgets)}</Grid>
            </Grid>
        </>
    );
});