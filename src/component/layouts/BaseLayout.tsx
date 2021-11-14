import * as React from 'react';
import { Grid, Container } from '@material-ui/core';
import { Navbar } from './navigation/Navbar';
import { File } from 'util/model';
import { ScrollToTopButton } from 'component/general/button/ScrollToTopButton';
import { useIsRetina } from 'util/useIsRetina';
import { useTenant } from 'util/tenant/useTenant';
import { useServerData } from 'component/ServerDataContext';
import getConfig from 'next/config';
import Head from 'next/head';

import styles from './BaseLayout.module.scss';

const {
    publicRuntimeConfig: { cloudimageToken },
} = getConfig();

export const BaseLayout = React.memo(({ children }) => {
    const tenant = useTenant();
    const { baseUrl } = useServerData();
    const retinaMultiplier = useIsRetina() ? 2 : 1;
    return (
        <Container className={styles.root}>
            <Head>
                <style>
                    {`
            body {
                font-family: var(--lotta-typography-font-family);
            }

            body::after {
                content: '';
                position: fixed;
                top: 0;
                height: 100vh; /* fix for mobile browser address bar appearing disappearing */
                left: 0;
                right: 0;
                z-index: -1;
                background-color: rgba(var(--lotta-page-background-color), 1);
                background-attachment: scroll;
                background-size: cover;
            }

            ${
                tenant.configuration.backgroundImageFile &&
                `
                @media screen and (min-width: 600px) {
                    body::after {
                        background-image: url(${File.getFileRemoteLocation(
                            baseUrl,
                            tenant.configuration.backgroundImageFile
                        )});
                    }
                }
            `
            }
        `}
                </style>
            </Head>
            <header className={styles.header}>
                <Grid container style={{ height: '100%' }}>
                    <Grid item md={3} className={styles.logoGridItem}>
                        {tenant.configuration.logoImageFile && (
                            // eslint-disable-next-line @next/next/no-img-element
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
                    {typeof window !== 'undefined' && <ScrollToTopButton />}
                </Grid>
            </main>
        </Container>
    );
});
BaseLayout.displayName = 'BaseLayout';
