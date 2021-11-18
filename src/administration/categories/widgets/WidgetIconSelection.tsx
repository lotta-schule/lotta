import * as React from 'react';
import { Grid } from '@material-ui/core';
import { WidgetIconModel } from 'model';
import { iconNameMapping, WidgetIcon } from 'category/widgets/WidgetIcon';
import { Button } from 'shared/general/button/Button';
import { Label } from 'shared/general/label/Label';
import { Input } from 'shared/general/form/input/Input';
import { Select } from 'shared/general/form/select/Select';

import styles from './WidgetIconSelection.module.scss';

export interface WidgetIconSelectionProps {
    icon: WidgetIconModel;
    onSelectIcon(icon: WidgetIconModel): void;
}

export const WidgetIconSelection = React.memo<WidgetIconSelectionProps>(
    ({ icon, onSelectIcon }) => {
        return (
            <Grid container>
                <Grid item xs={12}>
                    <h6>Icon wählen</h6>
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
                            <div className={styles.overlayTextDescription}>
                                Icon um einen Buchstaben oder eine Zahl
                                ergänzen:
                            </div>
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
                                    <Label
                                        className={styles.label}
                                        label={'Textfarbe'}
                                    >
                                        <Select
                                            onChange={(e) =>
                                                onSelectIcon({
                                                    ...icon,
                                                    overlayTextColor:
                                                        e.currentTarget.value,
                                                })
                                            }
                                            value={icon.overlayTextColor ?? ''}
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
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item md={3} style={{ maxHeight: '7em' }}>
                            <div style={{ textAlign: 'center' }}>Vorschau:</div>
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
WidgetIconSelection.displayName = 'WidgetIconSelection';
