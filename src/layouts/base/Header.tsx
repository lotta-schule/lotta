import * as React from 'react';
import { Grid } from '@material-ui/core';
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
            <Grid
                container
                className={clsx(styles.root, {
                    [styles.hasBannerImage]: !!bannerImageUrl,
                })}
                data-testid="Header"
            >
                <Grid
                    item
                    xs={12}
                    sm={8}
                    data-testid="HeaderContent"
                    className={styles.subheader}
                    style={
                        bannerImageUrl
                            ? { backgroundImage: `url(${bannerImageUrl})` }
                            : undefined
                    }
                >
                    {children}
                </Grid>
                <Grid
                    item
                    xs={false}
                    sm={4}
                    className={styles.userNavigationGridItem}
                >
                    <UserNavigation />
                </Grid>
            </Grid>
        );
    }
);
Header.displayName = 'Header';
