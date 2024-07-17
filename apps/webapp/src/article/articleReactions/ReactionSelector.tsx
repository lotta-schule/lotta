import { Button, Popover } from '@lotta-schule/hubert';
import { memo } from 'react';
import { Icon } from 'shared/Icon';

import styles from './ReactionSelector.module.scss';
import {
  supportedReactionIconNames,
  supportedReactionIcons,
} from './supportedReactionIcons';

export type ReactionSelectorProps = {
  trigger: HTMLElement;
  isOpen: boolean;
  onSelect: (iconName?: string) => void;
};

export const ReactionSelector = memo(
  ({ isOpen, trigger, onSelect }: ReactionSelectorProps) => {
    return (
      <Popover
        isOpen={isOpen}
        trigger={trigger}
        placement="top"
        onClose={() => onSelect()}
      >
        <div className={styles.root}>
          {supportedReactionIconNames.map((iconName) => (
            <Button
              key={iconName}
              icon={<Icon icon={supportedReactionIcons[iconName].icon} />}
              onClick={() => onSelect(iconName)}
            />
          ))}
        </div>
      </Popover>
    );
  }
);
ReactionSelector.displayName = 'ReactionSelector';
