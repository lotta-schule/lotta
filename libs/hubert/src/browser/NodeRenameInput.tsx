import * as React from 'react';
import { BrowserPath, useBrowserState } from './BrowserStateContext.js';
import { Input } from '../form/index.js';
import { CircularProgress } from '../progress/index.js';
import { Popover, PopoverContent } from '../popover/index.js';
import { ErrorMessage } from '../message/index.js';

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
