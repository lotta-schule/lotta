import * as React from 'react';
import * as ReactDOM from 'react-dom';
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
    const isBrowser = typeof window !== 'undefined';

    const springProps = useSpring({
        to: { opacity: open ? 1 : 0 },
        ...style,
    });

    const element = React.useRef<HTMLDivElement | null>(null);

    if (isBrowser && element.current === null) {
        element.current = document.createElement('div');
        document
            .getElementById('dialogContainer')!
            .appendChild(element.current);
    }

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

    if (!open || !isBrowser) {
        return null;
    }

    return ReactDOM.createPortal(
        <DialogShell
            style={springProps as any}
            onRequestClose={onRequestClose}
            {...props}
        />,
        element.current as HTMLDivElement
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
            <animated.div
                {...otherProps}
                {...overlayProps}
                {...dialogProps}
                {...modalProps}
                className={clsx(styles.dialog, className)}
                ref={ref}
                style={style}
            >
                <FocusScope contain autoFocus>
                    <div>
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
                    </div>
                </FocusScope>
            </animated.div>
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
