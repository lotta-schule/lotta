import * as React from 'react';
import { Button } from '@lotta-schule/hubert';
import {
    faChevronLeft,
    faChevronRight,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FileModel } from 'model';
import { File } from 'util/model';
import { useWindowSize } from 'util/useWindowSize';
import { useIsRetina } from 'util/useIsRetina';
import { useLockBodyScroll } from 'util/useLockBodyScroll';
import { useServerData } from 'shared/ServerDataContext';
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
        ({
            selectedFile,
            selectedUrl,
            caption,
            onPrevious,
            onNext,
            onClose,
        }) => {
            useLockBodyScroll();
            const { baseUrl } = useServerData();
            const { innerHeight, innerWidth } = useWindowSize();
            const retinaMultiplier = useIsRetina() ? 2 : 1;
            const [width, height] = [innerWidth, innerHeight].map((px) =>
                Math.floor(px * 0.8 * retinaMultiplier)
            );

            const onKeyDown: React.KeyboardEventHandler<Window> =
                React.useCallback(
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
                        src={
                            (selectedFile
                                ? File.getFileRemoteLocation(
                                      baseUrl,
                                      selectedFile
                                  )
                                : selectedUrl)!
                        }
                        alt={caption ?? ''}
                        width={width}
                        height={height}
                        className={styles.image}
                        resize={'inside'}
                        sizes={'80vw'}
                    />
                    {caption && (
                        <div className={styles.subtitles}>{caption}</div>
                    )}
                </div>
            );
        }
    );
ImageOverlay.displayName = 'ImageOverlay';
