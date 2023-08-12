import * as React from 'react';
import { UserNavigation } from './navigation/UserNavigation';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import { useServerData } from 'shared/ServerDataContext';
import clsx from 'clsx';

import styles from './Header.module.scss';

export interface HeaderProps {
    bannerImageUrl?: string | null;
    children?: any;
}

export const Header = React.memo<HeaderProps>(
    ({ children, bannerImageUrl }) => {
        const { baseUrl } = useServerData();

        const normalizedUrl = bannerImageUrl?.startsWith('/')
            ? new URL(bannerImageUrl, baseUrl).toString()
            : bannerImageUrl;

        return (
            <section
                data-testid="Header"
                className={clsx(styles.root, {
                    [styles.hasBannerImage]: !!normalizedUrl,
                })}
            >
                <div data-testid="HeaderContent" className={styles.subheader}>
                    {normalizedUrl && (
                        <ResponsiveImage
                            src={normalizedUrl}
                            alt=""
                            width={900}
                            aspectRatio={'6:1'}
                            resize={'cover'}
                            maxDisplayWidth={700}
                            sizes="(max-width: 960px) 95vw, 700px"
                        />
                    )}
                    <div className={styles.headerContent}>{children}</div>
                </div>
                <div className={styles.userNavigationGridItem}>
                    <UserNavigation />
                </div>
            </section>
        );
    }
);
Header.displayName = 'Header';
