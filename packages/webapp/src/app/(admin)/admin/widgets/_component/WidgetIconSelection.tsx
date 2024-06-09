import * as React from 'react';
import { WidgetIconModel } from 'model';
import { iconNameMapping, WidgetIcon } from 'category/widgets/WidgetIcon';
import { Button, Input, Label, Option, Select } from '@lotta-schule/hubert';
import { Icon } from 'shared/Icon';

import styles from './WidgetIconSelection.module.scss';

export interface WidgetIconSelectionProps {
  icon: WidgetIconModel;
  onSelectIcon(icon: WidgetIconModel): void;
}

export const WidgetIconSelection = React.memo(
  ({ icon, onSelectIcon }: WidgetIconSelectionProps) => {
    return (
      <div className={styles.root}>
        <section>
          <h6>Icon wählen</h6>
          <div className={styles.iconScrollbar}>
            {Object.entries(iconNameMapping).map(([iconName, IconClass]) => (
              <Button
                key={iconName}
                onClick={() => onSelectIcon({ ...icon, iconName })}
                icon={<Icon icon={IconClass} />}
              />
            ))}
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
                        overlayText: e.currentTarget.value,
                      })
                    }
                  />
                </Label>
              </div>
              <div>
                <Select
                  fullWidth
                  className={styles.label}
                  title={'Textfarbe'}
                  onChange={(overlayTextColor) =>
                    onSelectIcon({
                      ...icon,
                      overlayTextColor,
                    })
                  }
                  value={icon.overlayTextColor || 'default'}
                >
                  <Option value={'default'}>weiß</Option>
                  <Option value={'primary'}>primär</Option>
                  <Option value={'secondary'}>sekundär</Option>
                </Select>
              </div>
            </div>
          </div>
          <div className={styles.preview}>
            <div>Vorschau:</div>
            <WidgetIcon
              className={styles.iconPreview}
              icon={icon}
              size={'2.5em'}
            />
          </div>
        </section>
      </div>
    );
  }
);
WidgetIconSelection.displayName = 'WidgetIconSelection';
