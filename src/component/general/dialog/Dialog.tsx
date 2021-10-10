import * as React from 'react';
import { Close } from '@material-ui/icons';
import { animated, useSpring } from 'react-spring';
import { Button } from '../button/Button';
import { Divider } from '../divider/Divider';
import { FocusScope } from '@react-aria/focus';
import { useModal, useOverlay, usePreventScroll } from '@react-aria/overlays';
import { useDialog } from '@react-aria/dialog';
import clsx from 'clsx';

import styles from './dialog.module.scss';

interface DialogProps extends Omit<React.HTMLProps<HTMLDivElement>, 'ref'> {
    className?: string;
    style?: React.CSSProperties;
    title?: string;
    open?: boolean;
    onRequestClose?: () => void | null;
}

export const Dialog: React.FC<DialogProps & { open?: boolean }> = ({
    open,
    onRequestClose,
    style,
    ...props
}) => {
    const springProps = useSpring({
        to: { opacity: open ? 1 : 0 },
        ...style,
    });

    React.useEffect(() => {
        if (open) {
            const onKeyDown = (e: KeyboardEvent) => {
                if (e.code === 'Escape') {
                    e.preventDefault();
                    onRequestClose?.();
                }
            };
            document.addEventListener('keydown', onKeyDown);
            return () => {
                document.removeEventListener('keydown', onKeyDown);
            };
        }
    }, [onRequestClose, open]);

    if (!open) {
        return null;
    }

    return (
        <DialogShell
            style={springProps as any}
            onRequestClose={onRequestClose}
            {...props}
        />
    );
};

export const DialogShell: React.FC<DialogProps> = ({
    children,
    className,
    style,
    title,
    onRequestClose,
    ...otherProps
}) => {
    const ref = React.useRef<HTMLDivElement>(null);

    usePreventScroll();
    const { modalProps } = useModal();
    const { overlayProps, underlayProps } = useOverlay(otherProps as any, ref);
    const { dialogProps, titleProps } = useDialog(otherProps as any, ref);

    return (
        <animated.div className={styles.root} style={style} {...underlayProps}>
            <FocusScope contain restoreFocus autoFocus>
                <animated.div
                    {...otherProps}
                    {...overlayProps}
                    {...dialogProps}
                    {...modalProps}
                    className={clsx(styles.dialog, className)}
                    ref={ref}
                    style={style}
                >
                    <section>
                        {onRequestClose && (
                            <Button
                                small
                                title={'schließen'}
                                className={styles.close}
                                onClick={() => onRequestClose()}
                                icon={<Close />}
                            />
                        )}
                        <h3 {...titleProps}>{title}</h3>
                        <Divider />
                    </section>
                    {children}
                </animated.div>
            </FocusScope>
        </animated.div>
    );
};

export const DialogContent: React.FC<React.HTMLProps<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    return <section className={clsx(className, styles.content)} {...props} />;
};

export const DialogActions: React.FC<React.HTMLProps<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    return <section className={clsx(className, styles.actions)} {...props} />;
};
