import * as React from 'react';
import { Button, Input } from '@lotta-schule/hubert';
import { Icon } from '#/shared/Icon';
import { faPencil } from '@fortawesome/free-solid-svg-icons';

import styles from './EditableText.module.scss';

export interface EditableTextProps {
  value: string;
  ariaLabel?: string;
  editButtonLabel?: string;
  allowEmpty?: boolean;
  onChange: (value: string) => void;
}

export const EditableText = ({
  value,
  ariaLabel,
  editButtonLabel,
  allowEmpty,
  onChange,
}: EditableTextProps) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);

  React.useEffect(() => {
    if (!isEditing) {
      setDraft(value);
    }
  }, [value, isEditing]);

  const commit = () => {
    setIsEditing(false);
    const next = draft.trim();
    if (next !== value && (next || allowEmpty)) {
      onChange(next);
    } else {
      setDraft(value);
    }
  };

  if (isEditing) {
    return (
      <Input
        inline
        autoFocus
        className={styles.editableInput}
        aria-label={ariaLabel}
        value={draft}
        onClick={(e: any) => e.stopPropagation()}
        onChange={(e: any) => setDraft(e.currentTarget.value)}
        onBlur={commit}
        onKeyDown={(e: any) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          } else if (e.key === 'Escape') {
            setDraft(value);
            setIsEditing(false);
          }
        }}
      />
    );
  }

  return (
    <span className={styles.editableText}>
      {value}
      <Button
        small
        className={styles.editButton}
        title={editButtonLabel ?? 'bearbeiten'}
        icon={<Icon icon={faPencil} color={'secondary'} />}
        onClick={(e: any) => {
          e.stopPropagation();
          e.preventDefault();
          setIsEditing(true);
        }}
      />
    </span>
  );
};
EditableText.displayName = 'EditableText';
