import * as React from 'react';
import { Navbar } from './navigation/Navbar';
import { File } from 'util/model';
import { Box, NoSsr, ScrollToTopButton } from '@lotta-schule/hubert';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import { useCloudimageUrl } from 'util/image/useCloudimageUrl';
import { useTenant } from 'util/tenant/useTenant';
import { useServerData } from 'shared/ServerDataContext';
import Link from 'next/link';

import styles from './BaseLayout.module.scss';

export const BaseLayout = React.memo(({ children }) => {
    const tenant = useTenant();
    const { baseUrl } = useServerData();

    const backgroundImageUrl =
        tenant.configuration.backgroundImageFile &&
        File.getFileRemoteLocation(
            baseUrl,
            tenant.configuration.backgroundImageFile
        );
    const { url: imageUrlSimple } = useCloudimageUrl(backgroundImageUrl, {
        width: 3000,
    });
    const { url: imageUrlRetina } = useCloudimageUrl(backgroundImageUrl, {
        width: 1500,
    });
    return (
        <Box className={styles.root}>
            {tenant.configuration.backgroundImageFile && (
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    @media screen and (min-width: 600px) {
                        body::after {
                            background-image: url(${imageUrlSimple});
                            background-image: image-set(url(${imageUrlSimple}) 1x, url(${imageUrlRetina}) 2x);
                        }
                    }
                `,
                    }}
                />
            )}
            <header className={styles.header}>
                <div className={styles.logoGridItem}>
                    {tenant.configuration.logoImageFile && (
                        <Link href={'/'} passHref>
                            <a title={'Startseite'}>
                                <ResponsiveImage
                                    resize={'fit'}
                                    height={80}
                                    src={File.getFileRemoteLocation(
                                        baseUrl,
                                        tenant.configuration.logoImageFile
                                    )}
                                    alt={`Logo ${tenant.title}`}
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
