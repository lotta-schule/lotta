import * as React from 'react';
import { UserNavigation } from './navigation/UserNavigation';
import clsx from 'clsx';

import styles from './Header.module.scss';

export interface HeaderProps {
    bannerImageUrl?: string;
    children?: any;
}

export const Header = React.memo<HeaderProps>(
    ({ children, bannerImageUrl }) => {
        return (
            <section
                className={clsx(styles.root, {
                    [styles.hasBannerImage]: !!bannerImageUrl,
                })}
                data-testid="Header"
            >
                <div
                    data-testid="HeaderContent"
                    className={styles.subheader}
                    style={
                        bannerImageUrl
                            ? { backgroundImage: `url(${bannerImageUrl})` }
                            : undefined
                    }
                >
                    {children}
                </div>
                <div className={styles.userNavigationGridItem}>
                    <UserNavigation />
                </div>
            </section>
        );
    }
);
Header.displayName = 'Header';
