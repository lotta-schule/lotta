import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@lotta-schule/hubert';

import styles from './EditOverlay.module.scss';

interface EditOverlayProps {
  label: string;
  description?: string;
  style?: React.CSSProperties;
  onClick(event: React.MouseEvent<HTMLButtonElement>): void;
  onClickRemove?(event: React.MouseEvent<HTMLButtonElement>): void;
  children?: any;
}

export const EditOverlay = React.memo(
  ({
    children,
    label,
    description,
    style,
    onClickRemove,
    onClick,
  }: EditOverlayProps) => {
    return (
      <div className={styles.root} style={style} data-testid={'EditOverlay'}>
        <div className={styles.overlay}>
          {!!onClickRemove && (
            <Button
              aria-label={'entfernen'}
              className={styles.removeButton}
              onClick={onClickRemove}
              icon={<Icon icon={faXmark} size={'lg'} />}
            />
          )}
          <Button onClick={onClick}>{label}</Button>
          {description && (
            <span className={styles.imageDescription}>{description}</span>
          )}
        </div>
        {children}
      </div>
    );
  }
);
EditOverlay.displayName = 'EditOverlay';
