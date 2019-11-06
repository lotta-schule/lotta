import React, { memo } from 'react';
import {
    makeStyles, Theme, Paper, Typography, TextField, Grid, List, ListItem, ListItemText, Box, Button,
} from '@material-ui/core';
import { BasicTenantSettings } from './BasicTenantSettings';
import Divider from '@material-ui/core/Divider';
import { Save as SaveIcon } from '@material-ui/icons';
import { theme } from 'theme';
import classNames from 'classnames';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
    margintop: {
        marginTop: theme.spacing(3),
    },
    colorpreview: {
        height: '2em',
        width: '2em',
        border: '1px solid',
        borderColor: '#e0e0e0',
    },
    leftIcon: {
        marginRight: theme.spacing(1),
    },
    iconSmall: {
        fontSize: 20,
    },
}));

export const TenantManagement = memo(() => {
    const styles = useStyles();

    return (
        <Paper className={styles.root}>

            <BasicTenantSettings />

            <Divider style={{ marginTop: theme.spacing(4), marginBottom: theme.spacing(2), }} />


            <Typography variant="h5">
                Mein Lotta – Individuelle Anpassungen
            </Typography>
            <Grid style={{ display: 'flex' }}>
                <Grid item sm={6}>
                    <List>
                        <ListItem>
                            <ListItem>
                                <div className={styles.colorpreview} style={{ backgroundColor: '#f3f3f3' }}>
                                </div>
                            </ListItem>
                            <ListItemText primary="Hintergrundfarbe" secondary="Hintergrund der Website" style={{ minWidth: '55%' }} />
                            <ListItem style={{ minWidth: '30%' }}>
                                <TextField
                                    defaultValue="#f3f3f3"
                                    margin="dense"
                                    variant="outlined"
                                    inputProps={{ 'aria-label': 'bare' }}
                                />
                            </ListItem>
                        </ListItem>
                        <ListItem>
                            <ListItem>
                                <div className={styles.colorpreview} style={{ background: 'linear-gradient(30deg,#f3f3f3,#d2ccc9)' }}>
                                </div>
                            </ListItem>
                            <ListItemText primary="Hintergrundverlauf" secondary="Hintergrund der Website" style={{ minWidth: '55%' }} />
                            <ListItem style={{ minWidth: '30%' }}>
                                <TextField
                                    defaultValue="linear-gradient(30deg,#f3f3f3,#d2ccc9)"
                                    margin="dense"
                                    variant="outlined"
                                    inputProps={{ 'aria-label': 'bare' }}
                                />
                            </ListItem>
                        </ListItem>
                        <ListItem>
                            <ListItem>
                                <div className={styles.colorpreview} style={{ background: theme.palette.primary.contrastText }}>
                                </div>
                            </ListItem>
                            <ListItemText primary="Box | Container Farbe" secondary="Hintergrund der Seitenelemente" style={{ minWidth: '55%' }} />
                            <ListItem style={{ minWidth: '30%' }}>
                                <TextField
                                    defaultValue="#ffffff"
                                    margin="dense"
                                    variant="outlined"
                                    inputProps={{ 'aria-label': 'bare' }}
                                />
                            </ListItem>
                        </ListItem>
                        <ListItem>
                            <ListItem>
                                <div className={styles.colorpreview} style={{ backgroundColor: theme.palette.primary.dark }}>
                                </div>
                            </ListItem>
                            <ListItemText primary="Textfarbe" secondary="Farbe der Schrift/Überschrift" style={{ minWidth: '55%' }} />
                            <ListItem style={{ minWidth: '30%' }}>
                                <TextField
                                    defaultValue="#222222"
                                    margin="dense"
                                    variant="outlined"
                                    inputProps={{ 'aria-label': 'bare' }}
                                />
                            </ListItem>
                        </ListItem>
                        <ListItem>
                            <ListItem>
                                <div className={styles.colorpreview} style={{ backgroundColor: theme.palette.secondary.main }}>
                                </div>
                            </ListItem>
                            <ListItemText primary="Akzentfarbe" secondary="Links, Buttons, Icons" style={{ minWidth: '55%' }} />
                            <ListItem style={{ minWidth: '30%' }}>
                                <TextField
                                    defaultValue="#ff5722"
                                    margin="dense"
                                    variant="outlined"
                                    inputProps={{ 'aria-label': 'bare' }}
                                />
                            </ListItem>
                        </ListItem>
                    </List>
                </Grid>
                <Grid item sm={6}>
                    <Typography>
                        <b>Schriftart</b>
                    </Typography>
                    <TextField
                        select
                        helperText="Hier Schriftart auswählen"
                        margin="dense"
                        variant="outlined"
                        fullWidth
                    />
                    <Box mt={2}>
                        <Typography variant="body1">
                            Beispieltext in Ihrer ausgewählten Schriftart. Achten Sie auf die korrekte Darstellung der Umlaute ü,ö,ä sowie ß und die Zahlen 1,2,3,4,5,6,7,8,9,0.
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
            <Box style={{ height: '2em' }}>
                <Button variant="contained" color="secondary" style={{ float: 'right' }}>
                    <SaveIcon className={classNames(styles.leftIcon, styles.iconSmall)} />
                    Änderungen speichern
                </Button>
            </Box>
        </Paper>
    );
});