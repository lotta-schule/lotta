import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Menu as HeadlessMenu } from '@headlessui/react';
import { usePopper, PopperProps } from 'react-popper';
import { Button, ButtonProps } from '../button/Button';
import omit from 'lodash/omit';

export type MenuProps = {
    buttonProps: ButtonProps;
    placement?: PopperProps<unknown>['placement'];
};

export const Menu: React.FC<MenuProps> = ({
    buttonProps,
    placement = 'bottom-end',
    children,
}) => {
    const isBrowser = typeof window !== 'undefined';
    const element = React.useRef<HTMLDivElement | null>(null);

    const [referenceButtonElement, setReferenceButtonElement] =
        React.useState<HTMLDivElement | null>(null);
    const [popperElement, setPopperElement] =
        React.useState<HTMLDivElement | null>(null);

    const { styles, attributes } = usePopper(
        referenceButtonElement,
        popperElement,
        { placement }
    );

    React.useEffect(() => () => element.current?.remove(), []);

    if (isBrowser && element.current === null) {
        element.current = document.createElement('div');
        document
            .getElementById('dialogContainer')!
            .appendChild(element.current);
    }
    return (
        <div style={{ position: 'relative' }}>
            <HeadlessMenu>
                <div
                    ref={setReferenceButtonElement}
                    style={{ display: 'inline-block' }}
                >
                    <HeadlessMenu.Button as={Button as any} {...buttonProps} />
                </div>
                {element.current &&
                    ReactDOM.createPortal(
                        <HeadlessMenu.Items
                            ref={setPopperElement}
                            style={{ zIndex: 10000, ...styles.popper }}
                            {...omit(attributes.popper, 'role')}
                        >
                            {children}
                        </HeadlessMenu.Items>,
                        element.current
                    )}
            </HeadlessMenu>
        </div>
    );
};
Menu.displayName = 'Menu';
