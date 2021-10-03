import * as React from 'react';
import { Apps } from '@material-ui/icons';
import { BaseLayoutMainContent } from 'component/layouts/BaseLayoutMainContent';
import { BaseLayoutSidebar } from 'component/layouts/BaseLayoutSidebar';
import { Header } from 'component/general/Header';
import Link from 'next/link';
import clsx from 'clsx';

import styles from './AdminLayout.module.scss';

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
    return (
        <>
            <BaseLayoutMainContent className={clsx(className, styles.root)}>
                <Header bannerImageUrl={'/bannerAdmin.png'}>
                    <h2 data-testid="title">Administration</h2>
                </Header>
                <div className={styles.titleBar}>
                    {hasHomeLink && (
                        <Link href={'/admin'} passHref>
                            <a title={'Zurück zum Administrations-Hauptmenü'}>
                                <Apps />
                                Hauptmenü
                            </a>
                        </Link>
                    )}
                    {!hasHomeLink && <Apps />}
                    <h2>{title}</h2>
                </div>
                <section className={styles.contentSection}>{children}</section>
            </BaseLayoutMainContent>
            <BaseLayoutSidebar isEmpty />
        </>
    );
};
