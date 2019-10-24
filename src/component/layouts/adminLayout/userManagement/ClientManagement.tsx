import React, { FunctionComponent, memo } from 'react';
import {
    makeStyles, Theme, Paper, Typography, TextField, Grid, CardMedia, Fab, CardContent, Checkbox,
    Card, CardActionArea, List, ListItem, ListItemText, Box, Button,
} from '@material-ui/core';
import { Edit } from '@material-ui/icons';
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
    headlines: {
        marginBottom: theme.spacing(2),
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

export const ClientManagement: FunctionComponent = memo(() => {
    const styles = useStyles();

    return (
        <Paper className={styles.root}>
            <Typography variant="h5" className={styles.headlines}>
                Mein Lotta – Grundeinstellungen
            </Typography>
            <Typography className={styles.margintop}>
                <b>Farbschema</b>
            </Typography>
            <Grid container style={{ display: 'flex' }}>
                <Grid item sm={3}>
                    <CardMedia
                        style={{ height: 150, margin: '0.5em', }}
                        image="https://placeimg.com/200/150/any"
                    />
                    <CardContent style={{ display: 'flex', paddingTop: 0, }}>
                        <Checkbox checked />
                        <Typography style={{ margin: 'auto 0' }}>
                            Standard
                        </Typography>
                    </CardContent>
                </Grid>
                <Grid item sm={3}>
                    <CardMedia
                        style={{ height: 150, margin: '0.5em', }}
                        image="https://placeimg.com/200/150/any"
                    />
                    <CardContent style={{ display: 'flex', paddingTop: 0, }}>
                        <Checkbox />
                        <Typography style={{ margin: 'auto 0' }}>
                            Königsblau
                        </Typography>
                    </CardContent>
                </Grid>
                <Grid item sm={3}>
                    <CardMedia
                        style={{ height: 150, margin: '0.5em', }}
                        image="https://placeimg.com/200/150/any"
                    />
                    <CardContent style={{ display: 'flex', paddingTop: 0, }}>
                        <Checkbox />
                        <Typography style={{ margin: 'auto 0' }}>
                            Immergrün
                        </Typography>
                    </CardContent>
                </Grid>
            </Grid>
            <Grid container style={{ display: 'flex' }}>
                <Grid item sm={5}>
                    <Typography className={styles.margintop}>
                        <b>Name der Seite</b>
                    </Typography>
                    <TextField
                        defaultValue="Webseiten-Name"
                        margin='dense'
                        style={{ width: '80%' }}
                    />
                </Grid>
                <Grid item sm={3}>
                    <Typography className={styles.margintop}>
                        <b>Logo der Seite</b>
                    </Typography>
                    <Card>
                        <CardActionArea>
                            <CardMedia
                                style={{ height: 80, margin: '0.5em', }}
                                image="https://placeimg.com/200/80/any"
                            />
                        </CardActionArea>
                    </Card>
                </Grid>
                <Grid item sm={1} style={{ display: 'flex' }}>
                    <Fab color="secondary" aria-label="Edit" size="small" style={{ margin: 'auto' }}>
                        <Edit />
                    </Fab>
                </Grid>
                <Grid item sm={3} style={{ display: 'flex' }}>
                    <Typography style={{ margin: 'auto' }}>
                        Das Logo sollte wird eine feste Höhe von 80px haben.
                    </Typography>
                </Grid>
            </Grid>
            <Divider style={{ marginTop: theme.spacing(4), marginBottom: theme.spacing(2), }} />
            <Typography variant="h5" className={styles.headlines}>
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