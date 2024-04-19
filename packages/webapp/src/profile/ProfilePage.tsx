import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Deletable,
  Divider,
  List,
  ListItem,
  ErrorMessage,
  Input,
  Label,
} from '@lotta-schule/hubert';
import { useMutation } from '@apollo/client';
import { EnrollmentTokensEditor } from 'profile/component/EnrollmentTokensEditor';
import { SelectFileButton } from 'shared/edit/SelectFileButton';
import { UpdateEmailDialog } from 'shared/dialog/UpdateEmailDialog';
import { UpdatePasswordDialog } from 'shared/dialog/UpdatePasswordDialog';
import { File, User } from 'util/model';
import { FileModelType, UserModel, FileModel } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useGetFieldError } from 'util/useGetFieldError';
import { useServerData } from 'shared/ServerDataContext';
import { Header, Main } from 'layout';
import Link from 'next/link';

import UpdateProfileMutation from 'api/mutation/UpdateProfileMutation.graphql';

import styles from './ProfilePage.module.scss';

export const ProfilePage = () => {
  const { baseUrl } = useServerData();
  const currentUser = useCurrentUser()!;

  const [classOrShortName, setClassOrShortName] = React.useState(
    currentUser.class
  );
  const [name, setName] = React.useState(currentUser.name);
  const [nickname, setNickname] = React.useState(currentUser.nickname);
  const [isHideFullName, setIsHideFullName] = React.useState(
    currentUser.hideFullName
  );
  const [avatarImageFile, setAvatarImageFile] = React.useState<
    FileModel | null | undefined
  >(currentUser.avatarImageFile);
  const [enrollmentTokens, setEnrollmentTokens] = React.useState<string[]>(
    currentUser.enrollmentTokens ?? []
  );

  const [isShowUpdatePasswordDialog, setIsShowUpdatePasswordDialog] =
    React.useState(false);

  const [isShowUpdateEmailDialog, setIsShowUpdateEmailDialog] =
    React.useState(false);

  const [updateProfile, { error, loading: isLoading }] = useMutation<{
    user: UserModel;
  }>(UpdateProfileMutation);
  const getFieldError = useGetFieldError(error);

  return (
    <Main className={styles.root}>
      <Header bannerImageUrl={'/bannerProfil.png'}>
        <h2>Meine Daten</h2>
      </Header>

      <Box className={styles.container}>
        <h4>Meine Daten</h4>
        <ErrorMessage error={error} />
        <div className={styles.gridContainer}>
          <aside>
            <Deletable
              title={'Profilbild löschen'}
              onDelete={() => setAvatarImageFile(null)}
            >
              <Avatar
                src={
                  avatarImageFile
                    ? File.getFileRemoteLocation(baseUrl, avatarImageFile)
                    : User.getDefaultAvatarUrl(currentUser)
                }
                style={{ width: 150, height: 150 }}
                title={User.getNickname(currentUser)}
              />
            </Deletable>
            <br />
            <SelectFileButton
              buttonComponentProps={{
                color: 'secondary',
                size: 'small',
                disabled: isLoading,
              }}
              fileFilter={(f) => f.fileType === FileModelType.Image}
              label={'Profilbild ändern'}
              onSelect={(file: FileModel) => setAvatarImageFile(file)}
            />
            <Label className={styles.subheader} label={'Meine Gruppen'}>
              <List
                className={styles.groupList}
                data-testid="ProfileData-GroupsList"
              >
                {[...currentUser.groups]
                  .sort((g1, g2) => g2.sortKey - g1.sortKey)
                  .map((group) => (
                    <ListItem key={group.id}>{group.name}</ListItem>
                  ))}
              </List>
            </Label>

            <section className={styles.dangerSection}>
              <Divider className={styles.divider} />
              <Link href={'/profile/delete'} passHref legacyBehavior>
                <Button variant={'error'}>Benutzerkonto löschen</Button>
              </Link>
            </section>
          </aside>
          <section>
            <Label label="Deine Email-Adresse:">
              <Input
                autoFocus
                disabled
                id="email"
                value={currentUser.email}
                placeholder="beispiel@medienportal.org"
                type="email"
                maxLength={100}
              />
            </Label>
            <section className={styles.changePersonalData}>
              <Button onClick={() => setIsShowUpdateEmailDialog(true)}>
                Email ändern
              </Button>
              <Button onClick={() => setIsShowUpdatePasswordDialog(true)}>
                Passwort ändern
              </Button>
            </section>
            <Label label="Dein Vor- und Nachname">
              <Input
                autoFocus
                id="name"
                placeholder="Minnie Musterchen"
                onChange={(e) => setName(e.currentTarget.value)}
                maxLength={100}
                disabled={isLoading}
                value={name}
                type="name"
              />
            </Label>
            <ErrorMessage error={getFieldError('name') || null} />
            <Label label="Dein Spitzname">
              <Input
                autoFocus
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.currentTarget.value)}
                placeholder="El Professore"
                type="text"
                disabled={isLoading}
                maxLength={25}
              />
            </Label>
            <ErrorMessage error={getFieldError('nickname') || null} />

            <Checkbox isSelected={isHideFullName!} onChange={setIsHideFullName}>
              Deinen vollständigen Namen öffentlich verstecken
            </Checkbox>

            <div>
              <small>
                Verstecke deinen vollständigen Namen, damit er nur vom
                Administrator deiner Schule gesehen werden kann. Dein Name
                taucht nicht in den von dir erstellten Artikeln oder in deinem
                Profil auf. Stattdessen wird dein Spitzname angezeigt.
              </small>
            </div>
            <Divider className={styles.divider} />
            <h5>Meine Klasse / Mein Kürzel</h5>
            <p>
              Gib hier deine Klasse oder dein Kürzel ein. Damit kannst du
              Zugriff auf deinen Stundenplan erhalten, wenn deine Schule eine
              Erweiterung besitzt (z.B. das Informationssystem Indiware VP
              mobil) und diese verknüpft hat.
              <p>
                <small>
                  Hinweis: das Format deiner Klasse bzw. Kürzels wird vorgegeben
                  und muss grundsätzlich beachtet werden, damit der Stundenplan
                  korrekt angezeigt wird. Beispielkombination: " 9/3 ".
                </small>
              </p>
            </p>
            <Label label="Deine Klasse / Dein Kürzel:">
              <Input
                autoFocus
                id="classOrShortName"
                value={classOrShortName}
                onChange={(e) => setClassOrShortName(e.currentTarget.value)}
                placeholder="7/4"
                disabled={isLoading}
                maxLength={25}
              />
            </Label>
            <ErrorMessage error={getFieldError('class') || null} />

            <h5>Meine Einschreibeschlüssel</h5>
            <p>
              <small>
                Nutze Einschreibeschlüssel, um dich selbst in Gruppen
                einzutragen, um interne Medien einzusehen, die nicht öffentlich
                zugänglich sind. Einschreibeschlüssel erhältst du ggf. von einem
                Administrator.
              </small>
            </p>
            <EnrollmentTokensEditor
              disabled={isLoading}
              tokens={enrollmentTokens}
              setTokens={setEnrollmentTokens}
            />
            <Divider className={styles.divider} />

            <Button
              type={'submit'}
              style={{ float: 'right' }}
              disabled={isLoading}
              onClick={() =>
                updateProfile({
                  variables: {
                    user: {
                      name,
                      nickname,
                      class: classOrShortName,
                      hideFullName: isHideFullName,
                      avatarImageFile: avatarImageFile
                        ? { id: avatarImageFile.id }
                        : null,
                      enrollmentTokens,
                    },
                  },
                })
              }
            >
              Speichern
            </Button>
            <UpdatePasswordDialog
              isOpen={isShowUpdatePasswordDialog}
              onRequestClose={() => setIsShowUpdatePasswordDialog(false)}
            />
            <UpdateEmailDialog
              isOpen={isShowUpdateEmailDialog}
              onRequestClose={() => setIsShowUpdateEmailDialog(false)}
            />
          </section>
        </div>
      </Box>
    </Main>
  );
};
