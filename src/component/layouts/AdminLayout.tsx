import React, { FunctionComponent, memo } from 'react';
import { useSelector } from 'react-redux';
import { UserModel } from 'model';
import { State } from 'store/State';
import useRouter from 'use-react-router';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import { BaseLayoutSidebar } from './BaseLayoutSidebar';

export const AdminLayout: FunctionComponent = memo(() => {
    const user = useSelector<State, UserModel | null>(s => s.user.user);
    const { history } = useRouter();
    if (!user) {
        history.replace('/');
        return <div></div>;
    }
    return (
        <>
            <BaseLayoutMainContent>
                Hier ist der Hauptinhalt
            </BaseLayoutMainContent>
            <BaseLayoutSidebar>
                Vielleicht noch irgendwas in der Seitenleiste einfügen?
            </BaseLayoutSidebar>
        </>
    );
});