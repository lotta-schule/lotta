import React, { FunctionComponent, memo } from 'react';
import { Typography, Paper, List, ListItem, ListItemText, makeStyles, Divider, } from '@material-ui/core';

const useStyles = makeStyles(() => ({
    widget: {
        borderRadius: 0,
        marginTop: '0.5em',
        padding: '0.5em',
    }
}));

export const SCalendar: FunctionComponent = memo(() => {
    const styles = useStyles();

    return (
        <Paper className={styles.widget}>
            <Typography variant={'h6'}>
                Kalender
            </Typography>
            <Typography variant={'body1'} style={{margin: '0.5em 0'}}>
                Schule
            </Typography>
            <List dense>
                <ListItem>
                    <ListItemText>
                        25.03.20
                    </ListItemText>
                    <ListItemText>
                        16:00-18:00
                    </ListItemText>
                    <ListItemText>
                        Hopsetag
                    </ListItemText>
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemText>
                        25.03.20
                    </ListItemText>
                    <ListItemText>
                        16:00-18:00
                    </ListItemText>
                    <ListItemText>
                        Hopsetag
                    </ListItemText>
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemText>
                        25.03.20
                    </ListItemText>
                    <ListItemText>
                        16:00-18:00
                    </ListItemText>
                    <ListItemText>
                        Hopsetag
                    </ListItemText>
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemText>
                        25.03.20
                    </ListItemText>
                    <ListItemText>
                        16:00-18:00
                    </ListItemText>
                    <ListItemText>
                        Hopsetag
                    </ListItemText>
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemText>
                        25.03.20
                    </ListItemText>
                    <ListItemText>
                        16:00-18:00
                    </ListItemText>
                    <ListItemText>
                        Hopsetag
                    </ListItemText>
                </ListItem>
            </List>
        </Paper>
    );
});