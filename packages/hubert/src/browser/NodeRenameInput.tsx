import * as React from 'react';
import { BrowserPath, useBrowserState } from './BrowserStateContext';
import { Input } from '../form';
import { CircularProgress } from '../progress';
import { Popover } from '../popover/new/Popover';
import { ErrorMessage } from '../message';

import styles from './NodeRenameInput.module.scss';

export type NodeRenameInputProps = {
  path: BrowserPath;
  onRequestClose: () => void;
};

export const NodeRenameInput = React.memo(
  ({ path, onRequestClose }: NodeRenameInputProps) => {
    const renamingInputRef = React.useRef<HTMLInputElement>(null);
    const node = path.at(-1);

    const [newNodeName, setNewNodeName] = React.useState(node?.name || '');
    const [isLoading, setIsLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    const { renameNode } = useBrowserState();

    React.useEffect(() => {
      if (renamingInputRef.current) {
        renamingInputRef.current.focus();
      }
    }, []);

    React.useEffect(() => {
      setErrorMessage(null);
    }, [newNodeName]);

    if (!node) {
      return null;
    }

    return (
      <form
        className={styles.root}
        onSubmit={async (e) => {
          e.preventDefault();
          if (newNodeName.length > 0) {
            setIsLoading(true);
            try {
              await renameNode?.(node, newNodeName);
              onRequestClose();
            } catch (e: any) {
              setErrorMessage(
                e.message || 'Fehler beim Umbenennen des Ordners.'
              );
            } finally {
              setIsLoading(false);
            }
          }
        }}
      >
        <Input
          autoFocus
          title={`${node.name} umbenennen`}
          ref={renamingInputRef}
          readOnly={isLoading}
          value={newNodeName}
          onBlur={onRequestClose}
          onChange={(e) => setNewNodeName(e.currentTarget.value)}
        />
        <Popover
          isOpen={!!errorMessage}
          placement={'bottom'}
          trigger={renamingInputRef.current!}
          onClose={() => setErrorMessage(null)}
        >
          <ErrorMessage error={errorMessage} />
        </Popover>
        {isLoading && (
          <CircularProgress
            className={styles.progress}
            size={'1em'}
            aria-label={'Datei wird umbenannt'}
            isIndeterminate
          />
        )}
      </form>
    );
  }
);
NodeRenameInput.displayName = 'NodeRenameInput';
