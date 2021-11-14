import * as React from 'react';
import { Apps, Error as ErrorIcon } from '@material-ui/icons';
import { BaseLayoutMainContent } from 'component/layouts/BaseLayoutMainContent';
import { BaseLayoutSidebar } from 'component/layouts/BaseLayoutSidebar';
import { Header } from 'component/general/Header';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { User } from 'util/model';
import Link from 'next/link';
import clsx from 'clsx';

import styles from './AdminLayout.module.scss';
import { Card, CardContent } from '@material-ui/core';

interface AdminLayoutProps {
    className?: string;
    hasHomeLink?: boolean;
    title: string | React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
    children,
    className,
    hasHomeLink,
    title,
}) => {
    const user = useCurrentUser();

    const isAllowed = User.isAdmin(user);

    return (
        <>
            <BaseLayoutMainContent className={clsx(className, styles.root)}>
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
                            {children}
                        </section>
                    </>
                )}
                {!isAllowed && (
                    <Card>
                        <CardContent>
                            <div className={styles.noAccessMessageContainer}>
                                <div>
                                    <ErrorIcon />
                                    <span>
                                        Du hast nicht die notwendigen Rechte,
                                        diese Seite zu sehen.
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </BaseLayoutMainContent>
            <BaseLayoutSidebar isEmpty />
        </>
    );
};
