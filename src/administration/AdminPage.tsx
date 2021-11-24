import * as React from 'react';
import { Apps, Error as ErrorIcon } from '@material-ui/icons';
import { Box } from 'shared/general/layout/Box';
import { Header, Main, Sidebar } from 'layout';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { User } from 'util/model';
import Link from 'next/link';
import clsx from 'clsx';

import styles from './AdminPage.module.scss';

interface AdminPageProps {
    className?: string;
    hasHomeLink?: boolean;
    title: string | React.ReactNode;
    component: React.FC;
}

export const AdminPage: React.FC<AdminPageProps> = ({
    component: Component,
    className,
    hasHomeLink,
    title,
}) => {
    const user = useCurrentUser();

    const isAllowed = User.isAdmin(user);

    return (
        <>
            <Main className={clsx(className, styles.root)}>
                <Header bannerImageUrl={'/bannerAdmin.png'}>
                    <h2 data-testid={'title'}>Administration</h2>
                </Header>
                {isAllowed && (
                    <>
                        <div className={styles.titleBar}>
                            {hasHomeLink && (
                                <Link href={'/admin'} passHref>
                                    <a
                                        title={
                                            'Zurück zum Administrations-Hauptmenü'
                                        }
                                    >
                                        <Apps />
                                        Hauptmenü
                                    </a>
                                </Link>
                            )}
                            {!hasHomeLink && <Apps />}
                            <h2>{title}</h2>
                        </div>
                        <section className={styles.contentSection}>
                            <Component />
                        </section>
                    </>
                )}
                {!isAllowed && (
                    <Box>
                        <div className={styles.noAccessMessageContainer}>
                            <div>
                                <ErrorIcon />
                                <span>
                                    Du hast nicht die notwendigen Rechte, diese
                                    Seite zu sehen.
                                </span>
                            </div>
                        </div>
                    </Box>
                )}
            </Main>
            <Sidebar isEmpty />
        </>
    );
};
