import * as React from 'react';
import { BrowserPath, useBrowserState } from './BrowserStateContext';
import { Input } from '../form';
import { CircularProgress } from '../progress';
import { Popover, PopoverContent } from '../popover';
import { ErrorMessage } from '../message';

import styles from './NodeRenameInput.module.scss';

export type NodeRenameInputProps = {
  path: BrowserPath;
  onRequestClose: () => void;
};

export const NodeRenameInput = React.memo(
  ({ path, onRequestClose }: NodeRenameInputProps) => {
    const [renamingInput, setRenamingInput] =
      React.useState<HTMLInputElement | null>(null);
    const node = path.at(-1);

    const [newNodeName, setNewNodeName] = React.useState(node?.name || '');
    const [isLoading, setIsLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    const { renameNode } = useBrowserState();

    React.useEffect(() => {
      if (renamingInput) {
        renamingInput.focus();
      }
    }, [renamingInput]);

    React.useEffect(() => {
      setErrorMessage(null);
    }, [newNodeName]);

    if (!node) {
      return null;
    }

    return (
      <Popover
        open={!!errorMessage}
        placement={'bottom'}
        onOpenChange={(open) => open || setErrorMessage(null)}
        reference={renamingInput}
      >
        <form
          className={styles.root}
          onSubmit={async (e) => {
            console.log('submit');
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
            ref={setRenamingInput}
            readOnly={isLoading}
            value={newNodeName}
            onBlur={onRequestClose}
            onChange={(e) => setNewNodeName(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onRequestClose();
              }
              if (e.key === 'Enter') {
                e.preventDefault();
                renamingInput?.form?.requestSubmit();
              }
            }}
          />
          <PopoverContent style={{ width: renamingInput?.clientWidth }}>
            <ErrorMessage error={errorMessage} />
          </PopoverContent>
          {isLoading && (
            <CircularProgress
              className={styles.progress}
              size={'1em'}
              aria-label={'Datei wird umbenannt'}
              isIndeterminate
            />
          )}
        </form>
      </Popover>
    );
  }
);
NodeRenameInput.displayName = 'NodeRenameInput';
