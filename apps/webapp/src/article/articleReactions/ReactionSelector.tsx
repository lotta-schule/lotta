import * as React from 'react';
import { Button, PopoverContent } from '@lotta-schule/hubert';
import { Icon } from 'shared/Icon';
import {
  supportedReactionIconNames,
  supportedReactionIcons,
} from './supportedReactionIcons';

import styles from './ReactionSelector.module.scss';

export type ReactionSelectorProps = {
  onSelect: (iconName?: string) => void;
};

const ReactionSelector = React.memo(({ onSelect }: ReactionSelectorProps) => {
  return (
    <PopoverContent className={styles.root} data-testid="ReactionSelector">
      {supportedReactionIconNames.map((iconName) => (
        <Button
          key={iconName}
          data-testid={`reaction-${iconName}`}
          icon={<Icon icon={supportedReactionIcons[iconName].icon} />}
          onClick={() => onSelect(iconName)}
        />
      ))}
    </PopoverContent>
  );
});
ReactionSelector.displayName = 'ReactionSelector';

export default ReactionSelector;
