import React from 'react';
import { render, screen, waitFor, getByText, getByRole } from 'test/util';
import { SomeUser } from 'test/fixtures';
import { ProfileData } from './ProfileData';
import { UpdateProfileMutation } from 'api/mutation/UpdateProfileMutation';
import userEvent from '@testing-library/user-event';

describe('component/layouts/profileLayout/ProfileData', () => {

    describe('show user data', () => {
        it('should show an input with the username', async () => {
            render(
                <ProfileData />,
                {}, { currentUser: SomeUser, useCache: true }
            );
            expect(screen.getByLabelText(/vor- und nachname/i)).toHaveValue('Ernesto Guevara');
        });

        it('should show an input with the user\'s email', async () => {
            render(
                <ProfileData />,
                {}, { currentUser: SomeUser, useCache: true }
            );
            expect(screen.getByLabelText(/Email-Adresse/i)).toHaveValue('user@lotta.schule');
        });

        it('should show an input with the user\'s name, nickname and class', async () => {
            render(
                <ProfileData />,
                {}, { currentUser: SomeUser, useCache: true }
            );
            expect(screen.getByLabelText(/vor- und nachname/i)).toHaveValue('Ernesto Guevara');
            expect(screen.getByLabelText(/spitzname/i)).toHaveValue('Che');
        });

        it('should check the corresponding checkbox if user is hiding his full name', async () => {
            render(
                <ProfileData />,
                {}, { currentUser: { ...SomeUser, hideFullName: true }, useCache: true }
            );
            expect(screen.getByLabelText(/öffentlich verstecken/i)).toBeChecked();
        });

        it('should send a change request with the correct data', async done => {
            let didCallUpdateData = false;
            const mocks = [{
                request: { query: UpdateProfileMutation, variables: { user: {
                    name: 'Ernesto Guevara',
                    nickname: 'Spitzi',
                    class: '5/1',
                    hideFullName: true,
                    email: 'neue-email@adresse.de',
                    avatarImageFile: null,
                    enrollmentTokens: []
                } } },
                result: () => {
                    didCallUpdateData = true;
                    return { data: { user: {
                        name: 'Ernesto Guevara',
                        nickname: 'Spitzi',
                        class: '5/1',
                        hideFullName: true,
                        email: 'neue-email@adresse.de',
                        avatarImageFile: null,
                        enrollmentTokens: []
                    } } };
                }
            }];
            render(
                <ProfileData />,
                {}, {
                    currentUser: SomeUser,
                    useCache: true,
                    additionalMocks: mocks
                }
            );

            const emailField = screen.getByPlaceholderText('beispiel@medienportal.org') as HTMLInputElement;
            // const nameField = screen.getByLabelText('Dein Vor- und Nachname') as HTMLInputElement;
            const nicknameField = screen.getByLabelText('Dein Spitzname') as HTMLInputElement;
            const publishNameCheckbox = screen.getByLabelText('Deinen vollständigen Namen öffentlich verstecken') as HTMLInputElement;
            const classField = screen.getByLabelText('Deine Klasse / Dein Kürzel:') as HTMLInputElement;

            await userEvent.clear(emailField);
            await userEvent.clear(nicknameField);
            await userEvent.clear(classField);

            await userEvent.type(emailField, 'neue-email@adresse.de');
            await userEvent.type(nicknameField, 'Spitzi');
            await userEvent.click(publishNameCheckbox);
            await userEvent.type(classField, '5/1');

            await userEvent.click(screen.getByRole('button', { name: 'Speichern' }));

            await waitFor(() => {
                expect(didCallUpdateData).toEqual(true);
            });
            done();
        });
    });

    describe('Profile picture', () => {
        it('should open the file selection dialog when "Change profile picture" is selected', async done => {
            render(
                <ProfileData />,
                {}, { currentUser: { ...SomeUser, hideFullName: true }, useCache: true }
            );
            const profilePictureButton = screen.getAllByText('Profilbild ändern')[0];
            expect(profilePictureButton).toBeVisible();
            await userEvent.click(profilePictureButton);
            await waitFor(() => {
                expect(getByText(document.body, /datei auswählen/i)).toBeInTheDocument();
            });
            done();
        });
    });

    describe('Password', () => {
        it('should open the change password dialog when the change password button is clicked', async done => {
            render(
                <ProfileData />,
                {}, { currentUser: { ...SomeUser, hideFullName: true }, useCache: true }
            );
            const changePasswordButton = screen.getAllByText('Passwort ändern')[0];
            expect(changePasswordButton).toBeVisible();
            await userEvent.click(changePasswordButton);
            await waitFor(() => {
                expect(getByRole(document.body, 'heading', { name: 'Passwort ändern' })).toBeInTheDocument();
            });
            done();
        });
    });

});
