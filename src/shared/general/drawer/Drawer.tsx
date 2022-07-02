import * as React from 'react';
import { motion } from 'framer-motion';
import { useModal, useOverlay, usePreventScroll } from '@react-aria/overlays';
import { mergeProps } from '@react-aria/utils';
import { ChevronRight } from '@material-ui/icons';
import { Button } from 'shared/general/button/Button';

import styles from './Drawer.module.scss';

export interface DrawerProps {
    children?: React.ReactNode;
    isOpen?: boolean;
    onClose?(): void;
}

export const Drawer = ({ children, isOpen, onClose }: DrawerProps) => {
    const ref = React.useRef<HTMLDivElement>(null);
    usePreventScroll({ isDisabled: !isOpen });
    const { overlayProps } = useOverlay(
        {
            isDismissable: true,
            isKeyboardDismissDisabled: true,
            isOpen,
            onClose,
        },
        ref
    );

    const { modalProps } = useModal({});

    React.useEffect(() => {
        if (isOpen) {
            const handler = ({ code }: KeyboardEvent) => {
                if (code === 'Escape') {
                    onClose?.();
                }
            };
            document.addEventListener('keydown', handler);
            return () => {
                document.removeEventListener('keydown', handler);
            };
        }
        return undefined;
    }, [isOpen, onClose]);

    const props = mergeProps(overlayProps, modalProps) as any;

    return (
        <motion.div
            {...props}
            className={styles.drawer}
            ref={ref}
            role={'presentation'}
            animate={isOpen ? 'open' : 'closed'}
            variants={{
                open: { opacity: 1, x: 0 },
                closed: { opacity: 0, x: '100%' },
            }}
        >
            <div className={styles.sidebar}>
                <Button
                    aria-label={'Leiste schließen'}
                    icon={<ChevronRight />}
                    variant={'borderless'}
                    onClick={() => onClose?.()}
                />
            </div>
            <div className={styles.content}>{children}</div>
        </motion.div>
    );
};
