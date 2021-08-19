import * as React from 'react';
import { makeStyles, Grid, Typography, FormControl } from '@material-ui/core';
import { WidgetIconModel } from 'model';
import { iconNameMapping, WidgetIcon } from 'component/widgets/WidgetIcon';
import { Button } from 'component/general/button/Button';
import { Label } from 'component/general/label/Label';
import { Input } from 'component/general/form/input/Input';
import { Select } from 'component/general/form/select/Select';

export interface WidgetIconSelectionProps {
    icon: WidgetIconModel;
    onSelectIcon(icon: WidgetIconModel): void;
}

const useStyles = makeStyles((theme) => ({
    iconScrollbar: {
        display: 'flex',
        overflowX: 'auto',
        marginBottom: theme.spacing(2),
        height: '4em',
    },
    overlayTextDescription: {
        marginBottom: theme.spacing(1),
    },
    overlayTextTextField: {
        marginBottom: theme.spacing(2),
        width: '25%',
    },
    iconPreview: {
        float: 'right',
    },
    label: {
        top: '-0.4em',
        left: '0.8em',
    },
}));

export const WidgetIconSelection = React.memo<WidgetIconSelectionProps>(
    ({ icon, onSelectIcon }) => {
        const styles = useStyles();

        return (
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant={'h6'}>Icon wählen</Typography>
                    <div className={styles.iconScrollbar}>
                        {Object.entries(iconNameMapping).map(
                            ([iconName, IconClass]) => (
                                <Button
                                    key={iconName}
                                    onClick={() =>
                                        onSelectIcon({ ...icon, iconName })
                                    }
                                    icon={React.createElement(IconClass)}
                                />
                            )
                        )}
                    </div>
                </Grid>
                <Grid item xs={12} style={{ display: 'flex' }}>
                    <Grid container>
                        <Grid item md={9}>
                            <Typography
                                variant={'body1'}
                                className={styles.overlayTextDescription}
                            >
                                Icon um einen Buchstaben oder eine Zahl
                                ergänzen:
                            </Typography>
                            <Grid container>
                                <Grid item xs={6}>
                                    <Label label={'Beschriftung'}>
                                        <Input
                                            maxLength={1}
                                            value={icon.overlayText ?? ''}
                                            onChange={(e) =>
                                                onSelectIcon({
                                                    ...icon,
                                                    overlayText:
                                                        e.currentTarget.value,
                                                })
                                            }
                                        />
                                    </Label>
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <Label
                                            className={styles.label}
                                            label={'Textfarbe'}
                                        >
                                            <Select
                                                onChange={(e) =>
                                                    onSelectIcon({
                                                        ...icon,
                                                        overlayTextColor:
                                                            e.currentTarget
                                                                .value,
                                                    })
                                                }
                                                value={
                                                    icon.overlayTextColor ?? ''
                                                }
                                            >
                                                <option value={''}>weiß</option>
                                                <option value={'primary'}>
                                                    primär
                                                </option>
                                                <option value={'secondary'}>
                                                    sekundär
                                                </option>
                                            </Select>
                                        </Label>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item md={3} style={{ maxHeight: '7em' }}>
                            <Typography variant={'body1'} align={'center'}>
                                Vorschau:
                            </Typography>
                            <WidgetIcon
                                className={styles.iconPreview}
                                icon={icon}
                                size={'5em'}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
);
