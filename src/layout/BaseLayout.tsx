import * as React from 'react';
import { Navbar } from './navigation/Navbar';
import { File } from 'util/model';
import { NoSsr } from 'shared/general/util/NoSsr';
import { ScrollToTopButton } from 'shared/general/button/ScrollToTopButton';
import { Box } from 'shared/general/layout/Box';
import { useIsRetina } from 'util/useIsRetina';
import { useTenant } from 'util/tenant/useTenant';
import { useServerData } from 'shared/ServerDataContext';
import Link from 'next/link';
import getConfig from 'next/config';

import styles from './BaseLayout.module.scss';

const {
    publicRuntimeConfig: { cloudimageToken },
} = getConfig();

export const BaseLayout = React.memo(({ children }) => {
    const tenant = useTenant();
    const { baseUrl } = useServerData();
    const retinaMultiplier = useIsRetina() ? 2 : 1;
    return (
        <Box className={styles.root}>
            {tenant.configuration.backgroundImageFile && (
                <style>{`
                    @media screen and (min-width: 600px) {
                        body::after {
                            background-image: url(${File.getFileRemoteLocation(
                                baseUrl,
                                tenant.configuration.backgroundImageFile
                            )});
                        }
                    }
                `}</style>
            )}
            <header className={styles.header}>
                <div className={styles.logoGridItem}>
                    {tenant.configuration.logoImageFile && (
                        <Link href={'/'} passHref>
                            <a title={'Startseite'}>
                                <img
                                    src={`https://${cloudimageToken}.cloudimg.io/height/${
                                        80 * retinaMultiplier
                                    }/foil1/${File.getFileRemoteLocation(
                                        baseUrl,
                                        tenant.configuration.logoImageFile
                                    )}`}
                                    alt={`Logo ${tenant.title}`}
                                    className={styles.logo}
                                />
                            </a>
                        </Link>
                    )}
                </div>
                <div className={styles.titleGridItem}>
                    <h1>{tenant.title}</h1>
                </div>
            </header>
            <Navbar />
            <main className={styles.main}>
                {children}
                <NoSsr>
                    <ScrollToTopButton />
                </NoSsr>
            </main>
        </Box>
    );
});
BaseLayout.displayName = 'BaseLayout';
