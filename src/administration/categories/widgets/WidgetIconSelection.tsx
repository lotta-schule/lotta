import * as React from 'react';
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
            <div className={styles.root}>
                <section>
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
                </section>
                <section className={styles.iconStyle}>
                    <div className={styles.setting}>
                        <div className={styles.overlayTextDescription}>
                            Icon um einen Buchstaben oder eine Zahl ergänzen:
                        </div>
                        <div className={styles.gridContainer}>
                            <div>
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
                            </div>
                            <div>
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
                            </div>
                        </div>
                    </div>
                    <div className={styles.preview}>
                        <span>Vorschau:</span>
                        <WidgetIcon
                            className={styles.iconPreview}
                            icon={icon}
                            size={'5em'}
                        />
                    </div>
                </section>
            </div>
        );
    }
);
WidgetIconSelection.displayName = 'WidgetIconSelection';
