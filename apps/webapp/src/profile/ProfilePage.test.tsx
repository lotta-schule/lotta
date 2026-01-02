import * as React from 'react';
import { render, waitFor, userEvent } from 'test/util';
import { SomeUser, adminGroup, elternGroup, lehrerGroup } from 'test/fixtures';
import { ProfilePage } from './ProfilePage';

import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';
import UpdateProfileMutation from 'api/mutation/UpdateProfileMutation.graphql';
import GetUnpublishedArticlesQuery from 'api/query/GetUnpublishedArticlesQuery.graphql';
import GetFeedbackOverviewQuery from 'api/query/GetFeedbackOverviewQuery.graphql';

describe('shared/layouts/profileLayout/ProfileData', () => {
  describe('show userAvatar data', () => {
    it('should show an input with the username', async () => {
      const screen = render(<ProfilePage />, {}, { currentUser: SomeUser });
      expect(await screen.findByLabelText(/vor- und nachname/i)).toHaveValue(
        'Ernesto Guevara'
      );
    });

    it("should show a disabled input with the userAvatar's email", async () => {
      const screen = render(<ProfilePage />, {}, { currentUser: SomeUser });
      expect(await screen.findByLabelText(/Email-Adresse/i)).toHaveValue(
        'userAvatar@lotta.schule'
      );
      expect(await screen.findByLabelText(/Email-Adresse/i)).toBeDisabled();
    });

    it("should show an input with the userAvatar's name, nickname and class", async () => {
      const screen = render(<ProfilePage />, {}, { currentUser: SomeUser });
      expect(await screen.findByLabelText(/vor- und nachname/i)).toHaveValue(
        'Ernesto Guevara'
      );
      expect(await screen.findByLabelText(/spitzname/i)).toHaveValue('Che');
    });

    it('should check the corresponding checkbox if userAvatar is hiding his full name', async () => {
      const screen = render(
        <ProfilePage />,
        {},
        {
          currentUser: { ...SomeUser, hideFullName: true },
        }
      );
      expect(
        await screen.findByLabelText(/öffentlich verstecken/i)
      ).toBeChecked();
    });

    it('should send a change request with the correct data', async () => {
      const fireEvent = userEvent.setup();
      let didCallUpdateData = false;
      const mocks = [
        {
          request: {
            query: UpdateProfileMutation,
            variables: {
              user: {
                name: 'Ernesto Guevara',
                nickname: 'Spitzi',
                class: '5/1',
                hideFullName: true,
                avatarImageFile: null,
                enrollmentTokens: [],
              },
            },
          },
          result: () => {
            didCallUpdateData = true;
            return {
              data: {
                user: {
                  ...SomeUser,
                  name: 'Ernesto Guevara',
                  nickname: 'Spitzi',
                  class: '5/1',
                  hideFullName: true,
                  email: 'neue-email@adresse.de',
                  avatarImageFile: null,
                  enrollmentTokens: [],
                },
              },
            };
          },
        },
      ];
      const screen = render(
        <ProfilePage />,
        {},
        {
          currentUser: SomeUser,
          additionalMocks: mocks,
        }
      );

      // const nameField = screen.getByLabelText('Dein Vor- und Nachname') as HTMLInputElement;
      const nicknameField = screen.getByLabelText(
        'Dein Spitzname'
      ) as HTMLInputElement;
      const publishNameCheckbox = screen.getByLabelText(
        'Deinen vollständigen Namen öffentlich verstecken'
      ) as HTMLInputElement;
      const classField = screen.getByLabelText(
        'Deine Klasse / Dein Kürzel:'
      ) as HTMLInputElement;

      await fireEvent.clear(nicknameField);
      await fireEvent.clear(classField);

      await fireEvent.type(nicknameField, 'Spitzi');
      await fireEvent.click(publishNameCheckbox);
      await fireEvent.type(classField, '5/1');

      await fireEvent.click(screen.getByRole('button', { name: 'Speichern' }));

      await waitFor(() => {
        expect(didCallUpdateData).toEqual(true);
      });
    });
  });

  describe('User groups', () => {
    it("should show all the userAvatar's groups", async () => {
      const screen = render(
        <ProfilePage />,
        {},
        {
          currentUser: {
            ...SomeUser,
            groups: [adminGroup, lehrerGroup, elternGroup],
            assignedGroups: [adminGroup, lehrerGroup],
          },
          additionalMocks: [
            {
              request: { query: GetUnpublishedArticlesQuery },
              result: { data: { articles: [] } },
            },
            {
              request: { query: GetFeedbackOverviewQuery },
              result: {
                data: {
                  feedbacks: [],
                },
              },
            },
          ],
        }
      );
      const groupsList = await screen.findByTestId('ProfileData-GroupsList');
      expect(groupsList).toBeVisible();
      expect(groupsList).toHaveTextContent('Administrator');
      expect(groupsList).toHaveTextContent('Lehrer');
      expect(groupsList).toHaveTextContent('Eltern');
    });
  });

  describe('Profile picture', () => {
    it('should open the file selection dialog when "Change profile picture" is selected', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <ProfilePage />,
        {},
        {
          currentUser: { ...SomeUser, hideFullName: true },
          additionalMocks: [
            {
              request: {
                query: GetDirectoriesAndFilesQuery,
                variables: { parentDirectoryId: null },
              },
              result: { data: { files: [], directories: [] } },
            },
          ],
        }
      );
      const profilePictureButton = (
        await screen.findAllByText('Profilbild ändern')
      )[0];
      expect(profilePictureButton).toBeVisible();
      await fireEvent.click(profilePictureButton);
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /datei auswählen/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe('Password', () => {
    it('should open the change password dialog when the change password button is clicked', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <ProfilePage />,
        {},
        {
          currentUser: { ...SomeUser, hideFullName: true },
        }
      );
      const changePasswordButton = (
        await screen.findAllByText('Passwort ändern')
      )[0];
      expect(changePasswordButton).toBeVisible();
      await fireEvent.click(changePasswordButton);
      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            name: 'Passwort ändern',
          })
        ).toBeInTheDocument();
      });
    });
  });

  describe('Email', () => {
    it('should open the change email dialog when the change email button is clicked', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <ProfilePage />,
        {},
        {
          currentUser: SomeUser,
        }
      );
      const changeEmailButton = await screen.findByText('Email ändern');
      expect(changeEmailButton).toBeVisible();
      await fireEvent.click(changeEmailButton);
      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            name: 'Email ändern',
          })
        ).toBeInTheDocument();
      });
    });
  });
});
