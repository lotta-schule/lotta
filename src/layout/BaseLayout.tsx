import * as React from 'react';
import { Grid, Container, NoSsr } from '@material-ui/core';
import { Navbar } from './navigation/Navbar';
import { File } from 'util/model';
import { ScrollToTopButton } from 'shared/general/button/ScrollToTopButton';
import { useIsRetina } from 'util/useIsRetina';
import { useTenant } from 'util/tenant/useTenant';
import { useServerData } from 'shared/ServerDataContext';
import Link from 'next/link';
import getConfig from 'next/config';

import styles from './BaseLayout.module.scss';

const {
    publicRuntimeConfig: { cloudimageToken },
} = getConfig();

// TODO: Why not Container?
export const BaseLayout = React.memo(({ children }) => {
    const tenant = useTenant();
    const { baseUrl } = useServerData();
    const retinaMultiplier = useIsRetina() ? 2 : 1;
    return (
        <Container className={styles.root}>
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
                <Grid container style={{ height: '100%' }}>
                    <Grid item md={3} className={styles.logoGridItem}>
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
                    </Grid>
                    <Grid item md={9} className={styles.titleGridItem}>
                        <h1>{tenant.title}</h1>
                    </Grid>
                </Grid>
            </header>
            <Navbar />
            <main className={styles.main}>
                <Grid
                    container
                    justifyContent={'flex-start'}
                    className={styles.mainGrid}
                    wrap={'nowrap'}
                >
                    {children}
                    <NoSsr>
                        <ScrollToTopButton />
                    </NoSsr>
                </Grid>
            </main>
        </Container>
    );
});
BaseLayout.displayName = 'BaseLayout';
