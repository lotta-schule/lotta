import React from 'react';
import {
    render,
    cleanup
} from 'react-testing-library';
import { UserNavigation } from './UserNavigation';
import { UserModel, UserGroup } from '../../../model';
import { createBrowserHistory } from 'history';
import { Router } from 'react-router-dom';
import userEvent from 'user-event';

afterEach(cleanup);

const user: UserModel = {
    id: 'U001',
    email: 'user001@medienportal.org',
    name: 'User 001',
    group: UserGroup.STUDENT,
    avatar: 'https://avatars.dicebear.com/v2/avataaars/user001.svg'
};

describe('component/layouts/navigation/UserNavigation', () => {
    describe('user is not logged in', () => {
        it('should show 3 links', () => {
            const { container } = render(<Router history={createBrowserHistory()}><UserNavigation onLogin={() => { }} onLogout={() => { }} user={null} /></Router>);
            const links = container.querySelectorAll('li');
            expect(links.length).toEqual(3);
        });

        it('should show login button', () => {
            const { queryByText } = render(<Router history={createBrowserHistory()}><UserNavigation onLogin={() => { }} onLogout={() => { }} user={null} /></Router>);
            expect(queryByText('Anmelden')).not.toBeNull();
        });
    });

    describe('user is logged in', () => {
        it('should show 3 links', () => {
            const { container } = render(<Router history={createBrowserHistory()}><UserNavigation onLogin={() => { }} onLogout={() => { }} user={user} /></Router>);
            const links = container.querySelectorAll('li');
            expect(links.length).toEqual(3);
        })

        it('should show logout button and logout on call', () => {
            const onLogout = jest.fn();
            const { getByText } = render(
                <Router history={createBrowserHistory()}>
                    <UserNavigation
                        onLogin={() => { }}
                        onLogout={onLogout}
                        user={user}
                    />
                </Router>
            );
            const logoutButton = getByText('Abmelden');
            userEvent.click(logoutButton);
            expect(onLogout).toHaveBeenCalled();
        });

        it('should show the users profile avatar', () => {
            const { container } = render(<Router history={createBrowserHistory()}><UserNavigation onLogin={() => { }} onLogout={() => { }} user={user} /></Router>);
            expect(container.querySelector('img')).not.toBeNull();
        });

        it('should show the users profile link', () => {
            const { queryByText } = render(<Router history={createBrowserHistory()}><UserNavigation onLogin={() => { }} onLogout={() => { }} user={user} /></Router>);
            expect(queryByText('Profil')).not.toBeNull();
        });
    });
});