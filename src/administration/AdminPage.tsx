import * as React from 'react';
import { Box } from '@lotta-schule/hubert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCircleExclamation,
    faCubes,
} from '@fortawesome/free-solid-svg-icons';
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

    return <>
        <Main className={clsx(className, styles.root)}>
            <Header bannerImageUrl={'/bannerAdmin.png'}>
                <h2 data-testid={'title'}>Administration</h2>
            </Header>
            {isAllowed && (
                <>
                    <div className={styles.titleBar}>
                        {hasHomeLink && (
                            (<Link
                                href={'/admin'}
                                passHref
                                title={
                                    'Zurück zum Administrations-Hauptmenü'
                                }>

                                <FontAwesomeIcon icon={faCubes} />Hauptmenü
                            </Link>)
                        )}
                        {!hasHomeLink && <FontAwesomeIcon icon={faCubes} />}
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
                            <FontAwesomeIcon icon={faCircleExclamation} />
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
    </>;
};
