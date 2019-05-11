import React from 'react';
import {
    render,
    cleanup,
    waitForElement
} from 'react-testing-library';
import userEvent from 'user-event';
import { LoginDialog } from './LoginDialog';
import { mockUsers } from '../../mockData';

afterEach(cleanup);

describe('component/dialog/LoginDialog', () => {
    it('should render an open dialog', () => {
        const { queryByPlaceholderText, queryByText } = render(
            <LoginDialog
                isOpen={true}
                onAbort={() => { }}
                onLogin={() => { }}
            />);
        expect(queryByPlaceholderText(/beispiel@medienportal.org/)).not.toBeNull();
        expect(queryByPlaceholderText(/Passwort/)).not.toBeNull();
        expect(queryByText('Anmelden')).not.toBeNull();
    });

    it('should render a closed dialog', () => {
        const { container } = render(
            <LoginDialog
                isOpen={false}
                onAbort={() => { }}
                onLogin={() => { }}
            />);
        expect(container.firstChild).toBe(null);
    });

    it('should make the inputs readonly on loading', () => {
        const { getByPlaceholderText, getByText } = render(
            <LoginDialog
                isOpen={true}
                onAbort={() => { }}
                onLogin={() => { }}
            />);
        const emailInput = getByPlaceholderText(/beispiel@medienportal.org/);
        const passwordInput = getByPlaceholderText(/Passwort/);
        const confirmButton = getByText('Anmelden');
        userEvent.type(emailInput, 'beispiel@medienportal.org');
        userEvent.type(passwordInput, 'test123');
        userEvent.click(confirmButton);
        expect(emailInput).toHaveProperty('disabled', true);
        expect(passwordInput).toHaveProperty('disabled', true);
        expect(confirmButton.parentElement).toHaveProperty('disabled', true);
    });

    it('should login the user when correct data is given', done => {
        const user = mockUsers[0];
        const { getByPlaceholderText, getByText } = render(
            <LoginDialog
                isOpen={true}
                onAbort={() => { }}
                onLogin={(loggedUser) => {
                    expect(loggedUser.email).toBe(user.email);
                    done();
                }}
            />);
        const emailInput = getByPlaceholderText(/beispiel@medienportal.org/);
        const passwordInput = getByPlaceholderText(/Passwort/);
        const confirmButton = getByText('Anmelden');
        userEvent.type(emailInput, user.email);
        userEvent.type(passwordInput, user.password);
        userEvent.click(confirmButton);
    });

    it('should show an error message if wrong data is given', () => {
        const { getByPlaceholderText, getByText } = render(
            <LoginDialog
                isOpen={true}
                onAbort={() => { }}
                onLogin={() => { }}
            />);
        const emailInput = getByPlaceholderText(/beispiel@medienportal.org/);
        const passwordInput = getByPlaceholderText(/Passwort/);
        const confirmButton = getByText('Anmelden');
        userEvent.type(emailInput, 'beispiel@medienportal.org');
        userEvent.type(passwordInput, 'medienportal');
        userEvent.click(confirmButton);
        waitForElement(() => getByText(/Passwort falsch/));
    });
});