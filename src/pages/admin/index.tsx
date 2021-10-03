import * as React from 'react';
import { BaseLayoutMainContent } from 'component/layouts/BaseLayoutMainContent';
import { BaseLayoutSidebar } from 'component/layouts/BaseLayoutSidebar';
import { Header } from 'component/general/Header';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';

export const Admin = () => {
    return (
        <>
            <BaseLayoutMainContent>
                <Header bannerImageUrl={'/bannerAdmin.png'}>
                    <h2 data-testid="title">Administration</h2>
                </Header>
                <h3>Allgemein</h3>
                <ul>
                    <li>
                        <Link href={'/admin/system/general'}>
                            Grundeinstellungen
                        </Link>
                        <Link href={'/admin/system/presentation'}>
                            Darstellung
                        </Link>
                        <Link href={'/admin/system/usage'}>Nutzung</Link>
                    </li>
                </ul>
                <h3>Benutzerverwaltung</h3>
                <ul>
                    <li>
                        <Link href={'/admin/users/list'}>Nutzer</Link>
                        <Link href={'/admin/users/groups'}>Gruppen</Link>
                        <Link href={'/admin/users/constraints'}>
                            Beschränkungen
                        </Link>
                    </li>
                </ul>
                <h3>Kategorien</h3>
                <ul>
                    <li>
                        <Link href={'/admin/categories/list'}>Kategorien</Link>
                        <Link href={'/admin/categories/widgets'}>
                            Marginalen
                        </Link>
                    </li>
                </ul>
                <h3>Beiträge</h3>
                <ul>
                    <li>
                        <Link href={'/admin/unpublished'}>
                            freizugebende Beiträge
                        </Link>
                    </li>
                </ul>
            </BaseLayoutMainContent>
            <BaseLayoutSidebar isEmpty />
        </>
    );
};

export const getServerSideProps = async ({}: GetServerSidePropsContext) => {
    return {
        props: {},
    };
};

export default Admin;
