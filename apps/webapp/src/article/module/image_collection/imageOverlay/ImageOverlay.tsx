import * as React from 'react';
import { Button } from '@lotta-schule/hubert';
import {
  faChevronLeft,
  faChevronRight,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FileModel } from 'model';
import { useLockBodyScroll } from 'util/useLockBodyScroll';
import { Icon } from 'shared/Icon';
import { ResponsiveImage } from 'util/image/ResponsiveImage';

import styles from './ImageOverlay.module.scss';

export interface ImageOverlayProps {
  selectedUrl?: string | null;
  selectedFile?: FileModel | null;
  caption?: string;
  onPrevious?(
    e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<Window>
  ): void;
  onNext?(
    e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<Window>
  ): void;
  onClose(
    e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<Window>
  ): void;
}

export const ImageOverlay: React.FunctionComponent<ImageOverlayProps> =
  React.memo(
    ({ selectedFile, selectedUrl, caption, onPrevious, onNext, onClose }) => {
      useLockBodyScroll();

      const onKeyDown: React.KeyboardEventHandler<Window> = React.useCallback(
        (event) => {
          if (event.code === 'Escape') {
            onClose(event);
          } else if (event.code === 'ArrowLeft' && onPrevious) {
            onPrevious(event);
          } else if (event.code === 'ArrowRight' && onNext) {
            onNext(event);
          }
        },
        [onClose, onNext, onPrevious]
      );

      React.useEffect(() => {
        window.addEventListener('keydown', onKeyDown as any);
        return () => {
          window.removeEventListener('keydown', onKeyDown as any);
        };
      }, [onKeyDown]);

      if (!selectedFile && !selectedUrl) {
        return null;
      }

      return (
        <div className={styles.root}>
          <Button
            small
            icon={<Icon icon={faXmark} size={'lg'} />}
            className={styles.closeButton}
            onClick={onClose}
          />
          {onPrevious && (
            <Button
              small
              icon={<Icon icon={faChevronLeft} size={'lg'} />}
              className={styles.leftButton}
              onClick={onPrevious}
            />
          )}
          {onNext && (
            <Button
              small
              icon={<Icon icon={faChevronRight} size={'lg'} />}
              className={styles.rightButton}
              onClick={onNext}
            />
          )}
          <ResponsiveImage
            file={selectedFile || undefined}
            src={selectedUrl || undefined}
            alt={caption ?? ''}
            className={styles.image}
            sizes={['(max-width: 960px) 100vw', '80vw']}
            format="present"
          />
          {caption && <div className={styles.subtitles}>{caption}</div>}
        </div>
      );
    }
  );
ImageOverlay.displayName = 'ImageOverlay';
