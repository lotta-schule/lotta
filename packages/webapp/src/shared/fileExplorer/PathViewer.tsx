import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';

import { defaultState } from './context/FileExplorerContext';

import styles from './PathViewer.module.scss';

type Path = (typeof defaultState)['currentPath'];

export interface PathViewerProps {
  path: Path;
  onChange: (path: Path) => void;
}

export const PathViewer = React.memo(({ path, onChange }: PathViewerProps) => {
  return (
    <div className={styles.root}>
      {path.map((component, i) => (
        <React.Fragment key={component.id ?? 'root'}>
          {i !== 0 && <>/</>}
          <a
            href={'#'}
            aria-label={
              'name' in component ? component.name : 'Wurzelverzeichnis'
            }
            onClick={(e) => {
              e.preventDefault();
              onChange(path.slice(0, i + 1));
            }}
          >
            {'name' in component ? (
              component.name
            ) : (
              <FontAwesomeIcon icon={faHouse} />
            )}
          </a>
        </React.Fragment>
      ))}
    </div>
  );
});
PathViewer.displayName = 'PathViewer';
