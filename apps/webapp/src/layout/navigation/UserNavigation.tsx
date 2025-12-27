'use client';
import * as React from 'react';
import {
  faCirclePlus,
  faCircleUser,
  faCommentDots,
} from '@fortawesome/free-solid-svg-icons';
import {
  faComments,
  faFolder,
  faUser,
} from '@fortawesome/free-regular-svg-icons';
import {
  faMagnifyingGlass,
  faShieldHalved,
  faClipboardList,
  faArrowRightFromBracket,
  faCaretDown,
} from '@fortawesome/free-solid-svg-icons';
import {
  Badge,
  NavigationButton,
  MenuButton,
  Item,
} from '@lotta-schule/hubert';
import { useQuery } from '@apollo/client/react';
import { Icon } from 'shared/Icon';
import { ArticleModel } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Article, User } from 'util/model';
import { LoginDialog } from 'shared/dialog/LoginDialog';
import { RegisterDialog } from 'shared/dialog/RegisterDialog';
import { FeedbackDialog } from 'shared/dialog/FeedbackDialog';
import { useNewFeedbackCount } from 'util/feedback';
import { CreateArticleDialog } from 'shared/dialog/CreateArticleDialog';
import { CurrentUserAvatar } from 'shared/userAvatar/UserAvatar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';

import GetUnpublishedArticlesQuery from 'api/query/GetUnpublishedArticlesQuery.graphql';

import styles from './UserNavigation.module.scss';
import { redirectTo } from 'util/browserLocation';

export const UserNavigation = React.memo(() => {
  const currentUser = useCurrentUser();

  const router = useRouter();
  const { data: unpublishedArticlesData } = useQuery<{
    articles: ArticleModel[];
  }>(GetUnpublishedArticlesQuery, {
    skip: !User.isAdmin(currentUser),
  });
  const newMessagesBadgeNumber = currentUser?.unreadMessages ?? 0;

  const newFeedbackBadgeNumber = useNewFeedbackCount();

  const [loginModalIsOpen, setLoginModalIsOpen] = React.useState(false);
  const [feedbackModalIsOpen, setFeedbackModalIsOpen] = React.useState(false);
  const [registerModalIsOpen, setRegisterModalIsOpen] = React.useState(false);
  const [createArticleModalIsOpen, setCreateArticleModalIsOpen] =
    React.useState(false);

  const unpublishedBadgeNumber = unpublishedArticlesData?.articles.filter(
    (article) => !article.readyToPublish || !article.published
  ).length;

  const onAction = React.useCallback(
    (action: React.Key) => {
      switch (action) {
        case 'profile':
          router.push('/profile');
          return;
        case 'files':
          router.push('/profile/files');
          return;
        case 'own-articles':
          router.push('/profile/articles');
          return;
        case 'feedback':
          setFeedbackModalIsOpen(true);
          return;
        case 'administration':
          router.push('/admin');
          return;
        case 'unpublished':
          router.push('/unpublished');
          return;
        case 'logout':
          redirectTo('/auth/logout');
          return;
      }
    },
    [router]
  );

  const nav = React.useMemo(() => {
    if (currentUser) {
      return (
        <div className={styles.loggedInContainer}>
          <div className={styles.avatarContainer}>
            <CurrentUserAvatar size={100} />
          </div>
          <nav>
            <NavigationButton
              small
              secondary
              onClick={() => setCreateArticleModalIsOpen(true)}
              icon={<Icon icon={faCirclePlus} size={'xl'} />}
              label={'neuer Beitrag'}
              className={styles.navigationButton}
            ></NavigationButton>
            <Link href={'/search'} passHref legacyBehavior>
              <NavigationButton
                small
                secondary
                icon={<Icon icon={faMagnifyingGlass} size="xl" />}
                label={'Suche'}
                className={styles.navigationButton}
              ></NavigationButton>
            </Link>
            <Link href={'/messaging'} passHref legacyBehavior>
              <NavigationButton
                small
                secondary
                className={styles.navigationButton}
                icon={
                  <span>
                    <Icon icon={faComments} color={'secondary'} size="xl" />
                  </span>
                }
              >
                Nachrichten
                <Badge
                  className={styles.newMessageBadge}
                  value={newMessagesBadgeNumber}
                />{' '}
              </NavigationButton>
            </Link>
            <MenuButton
              title={'Nutzermenü'}
              placement={'bottom-end'}
              buttonProps={{
                icon: <Icon icon={faCircleUser} size={'xl'} />,
                variant: 'borderless',
                children: (
                  <>
                    Mein Profil{' '}
                    <Icon
                      icon={faCaretDown}
                      style={{ paddingRight: 0 }}
                      className={styles.navigationButtonInnerIcon}
                    />
                  </>
                ),
                className: styles.navigationButton,
              }}
              onAction={onAction}
            >
              {[
                <Item key={'profile'} textValue={'Meine Daten'}>
                  <Icon icon={faUser} color="secondary" />
                  Meine Daten
                </Item>,
                <Item key={'files'} textValue={'Meine Dateien und Medien'}>
                  <Icon icon={faFolder} color="secondary" />
                  Meine Dateien und Medien
                </Item>,
                <Item key={'own-articles'} textValue={'Meine Beiträge'}>
                  <Icon icon={faClipboardList} color="secondary" />
                  Meine Beiträge
                </Item>,
                <Item key={'feedback'} textValue={'Feedback'}>
                  <Icon icon={faCommentDots} color="secondary" />
                  Feedback
                </Item>,
                ...(User.isAdmin(currentUser)
                  ? [
                      <Item
                        key={'administration'}
                        textValue={'Seite administration'}
                      >
                        <Icon icon={faShieldHalved} color="secondary" />
                        <span>
                          Seite administrieren
                          <Badge
                            value={newFeedbackBadgeNumber}
                            data-testid="FeedbackBadge"
                          />
                        </span>
                      </Item>,
                      <Item
                        key={'unpublished'}
                        textValue={'Beiträge freigeben'}
                      >
                        <Icon icon={faClipboardList} color="secondary" />
                        <span>
                          Beiträge freigeben
                          <Badge value={unpublishedBadgeNumber} />
                        </span>
                      </Item>,
                    ]
                  : []),
                <Item key={'logout'} textValue={'Abmelden'}>
                  <Icon icon={faArrowRightFromBracket} color="secondary" />
                  Abmelden
                </Item>,
              ]}
            </MenuButton>
            <CreateArticleDialog
              isOpen={createArticleModalIsOpen}
              onAbort={() => setCreateArticleModalIsOpen(false)}
              onConfirm={(article) => {
                router.push(Article.getPath(article, { edit: true }));
              }}
            />
          </nav>
        </div>
      );
    } else {
      return (
        <nav>
          <NavigationButton
            secondary
            onClick={() => setLoginModalIsOpen(true)}
            label={'Anmelden'}
            className={clsx('secondary', 'small')}
          ></NavigationButton>
          <NavigationButton
            secondary
            onClick={() => setRegisterModalIsOpen(true)}
            label={'Registrieren'}
            className={clsx('secondary', 'small')}
          ></NavigationButton>
          <Link href={'/search'} passHref legacyBehavior>
            <NavigationButton
              secondary
              onClick={() => router.push('/search')}
              label={'Suche'}
              className={clsx('secondary', 'small')}
            ></NavigationButton>
          </Link>
          <RegisterDialog
            isOpen={registerModalIsOpen}
            onRequestClose={() => {
              setRegisterModalIsOpen(false);
            }}
          />
        </nav>
      );
    }
  }, [
    currentUser,
    newMessagesBadgeNumber,
    newFeedbackBadgeNumber,
    unpublishedBadgeNumber,
    createArticleModalIsOpen,
    registerModalIsOpen,
    onAction,
    router,
  ]);

  return (
    <div className={styles.root}>
      {nav}
      <LoginDialog
        isOpen={loginModalIsOpen}
        onRequestClose={() => {
          setLoginModalIsOpen(false);
        }}
      />
      <FeedbackDialog
        isOpen={feedbackModalIsOpen}
        onRequestClose={() => {
          setFeedbackModalIsOpen(false);
        }}
      />
    </div>
  );
});
UserNavigation.displayName = 'UserNavigation';
