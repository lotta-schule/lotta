import React, { FunctionComponent, memo } from 'react';
import { Paper, Typography, makeStyles, Theme, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, List, 
    ListItem, TextField, CardMedia, Button, Grid, Checkbox, FormControlLabel, Divider, Fab, FormControl, InputLabel, Select, MenuItem, Switch, withStyles, } from '@material-ui/core';
import { Add as AddCircleIcon, Delete, Edit, MoreVert } from '@material-ui/icons';
import classNames from 'classnames';
import { theme } from 'theme';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        padding: 2,
        display: 'flex',
        alignItems: 'center',
        width: 400,
        backgroundColor: '#efefef',
        borderRadius: 4,
    },
    container: {
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
    headlines: {
        marginBottom: theme.spacing(4),
    },
    expandButton: {
        marginLeft: theme.spacing(2),
        paddingRight: theme.spacing(3)
    },
    button: {
        marginBottom: theme.spacing(1),

    },
    leftIcon: {
        marginRight: theme.spacing(1),
    },
    iconSmall: {
        fontSize: 20,
    },
}));

const GreySwitch = withStyles({
    switchBase: {
      color: '#e0e0e0',
    }
})(Switch);
  

export const CategoriesManagement: FunctionComponent = memo(() => {
    const styles = useStyles();
    
    return (
        <Paper className={styles.container}>
                <Typography variant="h4" className={styles.headlines}>
                    Kategorienverwaltung
                    <Button size="small" variant="contained" color="secondary" className={styles.button} style={{ float: 'right', marginTop: theme.spacing(1), }}>
                        <AddCircleIcon className={classNames(styles.leftIcon, styles.iconSmall)} />
                        Kategorie hinzufügen
                    </Button>
                </Typography>
                <Typography variant="body1">
                </Typography>
                <Grid container style={{ display: 'flex' }}>
                    <Grid item sm={5} style={{ paddingRight: theme.spacing(4) }} >
                    <Typography variant="h5" style={{ marginBottom: theme.spacing(3) }}>
                            Kategorienübersicht
                        </Typography>
                        <ExpansionPanel>
                            <ExpansionPanelSummary aria-controls="panel1d-content" id="panel1d-header" style={{ backgroundColor: theme.palette.divider }}>
                                <Typography variant="body1">
                                    <MoreVert style={{ verticalAlign: 'bottom', marginRight: theme.spacing(3), }}/>
                                    <b>Startseite</b>
                                </Typography>
                            </ExpansionPanelSummary>
                        </ExpansionPanel>
                        <ExpansionPanel>
                            <ExpansionPanelSummary aria-controls="panel1d-content" id="panel1d-header" style={{ backgroundColor: theme.palette.divider }}>
                                <Typography variant="body1">
                                    <MoreVert style={{ verticalAlign: 'bottom', marginRight: theme.spacing(3), }}/>
                                    <b>GTA</b>
                                </Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <List component="nav">
                                    <ListItem>
                                        <Typography>
                                            <MoreVert style={{ verticalAlign: 'bottom', marginRight: theme.spacing(3), }}/>
                                            Aktuelles
                                        </Typography>
                                    </ListItem>
                                    <ListItem>
                                        <Typography>
                                            <MoreVert style={{ verticalAlign: 'bottom', marginRight: theme.spacing(3), }}/>
                                            Podcast
                                        </Typography>
                                    </ListItem>
                                </List>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                    </Grid>
                    <Grid item sm={7}>
                        <Typography variant="h5">
                            Einstellungen für Kategorie: GTA
                        </Typography>
                        <Typography style={{ marginTop: theme.spacing(3) }}>
                            <b>Kategorie-Name</b>
                        </Typography>
                        <TextField
                            defaultValue="GTA"
                            margin='dense'
                        />
                        <Typography style={{ marginTop: theme.spacing(3) }}>
                            <b>Sichtbarkeit</b>
                        </Typography>
                        <FormControlLabel control={<Checkbox value="checkedC" />} label="Öffentlich" />
                        <FormControlLabel control={<Checkbox value="checkedC" />} label="Schüler" />
                        <FormControlLabel control={<Checkbox value="checkedC" />} label="Lehrer" />
                        <FormControlLabel control={<Checkbox value="checkedC" />} label="verborgen" />
                        <Typography style={{ marginTop: theme.spacing(3) }}>
                            <b>Kategorie-Banner</b>
                        </Typography>
                        <Typography>
                            Bild ändern:
                        </Typography>
                        <Grid container style={{ display: 'flex' }}>
                            <Grid item sm={10}>
                                <CardMedia 
                                style={{ width: 300, height: 50, margin: '0.5em', }}
                                image="https://placeimg.com/300/50/any"
                                />
                            </Grid>
                            <Grid item sm={2}>
                                <Fab color="secondary" aria-label="Edit" size="small" style={{ marginTop: theme.spacing(2) }}> 
                                    <Edit />
                                </Fab>
                            </Grid>
                        </Grid>
                        <Typography style={{ marginTop: theme.spacing(3) }}>
                            <b>Weiterleitung</b>
                            <Grid container style={{ display: 'flex '}}>
                                <Grid item sm={4}>
                                    <FormControlLabel
                                        control={
                                        <GreySwitch value="checkedA" />
                                        }
                                        label="aktivieren"
                                        style={{ paddingTop: theme.spacing(2)}}
                                    />
                                </Grid>
                                <Grid item sm={8}>
                                <FormControl style={{ width: 200, }}>
                                    <InputLabel htmlFor="age-simple">zu Kategorie</InputLabel>
                                    <Select>
                                        <MenuItem value={10}>Aktuelles</MenuItem>
                                        <MenuItem value={20}>Podcast</MenuItem>
                                        <MenuItem value={30}>Foto-AG</MenuItem>
                                    </Select>
                                </FormControl>
                                </Grid>
                            </Grid>
                        </Typography>
                        <Divider style={{ marginBottom: theme.spacing(2), marginTop: theme.spacing(2) }} />
                        <Button size="small" variant="contained" color="secondary" className={styles.button}>
                            <Delete className={classNames(styles.leftIcon, styles.iconSmall)} />
                                Kategorie löschen
                        </Button>
                        <Typography>
                            (Achtung: kann im Nachhinein nicht mehr rückgängig gemacht werden!)
                        </Typography>
                    </Grid>
                </Grid>
        </Paper>
    );
});