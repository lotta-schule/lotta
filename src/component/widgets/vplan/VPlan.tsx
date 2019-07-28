import React, { FunctionComponent, memo } from 'react';
import { Typography, Paper, List, ListItem, ListItemText, makeStyles, Divider, } from '@material-ui/core';

const useStyles = makeStyles(() => ({
    widget: {
        borderRadius: 0,
        marginTop: '0.5em',
        padding: '0.5em',
    }
}));

export const VPlan: FunctionComponent = memo(() => {
    const styles = useStyles();

    return (
        <Paper className={styles.widget}>
            <Typography variant={'h6'}>
                Vertretungsplan
            </Typography>
            <Typography variant={'body1'} style={{margin: '0.5em 0'}}>
                Klasse 10/1
            </Typography>
            <List dense>
                <ListItem>
                    <ListItemText>
                        3./4.
                    </ListItemText>
                    <ListItemText>
                        Spo
                    </ListItemText>
                    <ListItemText>
                        Wie
                    </ListItemText>
                    <ListItemText>
                        HDS 2
                    </ListItemText>
                </ListItem>
                <ListItem>
                    <ListItemText>
                        5./6.
                    </ListItemText>
                    <ListItemText>
                        Ma
                    </ListItemText>
                    <ListItemText>
                        Reu
                    </ListItemText>
                    <ListItemText>
                        D14
                    </ListItemText>
                </ListItem>
            </List>
            <Divider />
            <Typography variant={'body1'} style={{margin: '0.5em 0'}}>
                zusätzliche Infos:
            </Typography>
            <Typography variant={'body2'}>
                Aufgrund der Wärme, werden die Sommerferien um eine Woche verlängert. Wir sehen uns dann am 26. Grüße vom Werner.
            </Typography>
        </Paper>
    );
});