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
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { Icon } from 'shared/Icon';
import { ArticleModel } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Article, User } from 'util/model';
import { LoginDialog } from 'shared/dialog/login';
import { RegisterDialog } from 'shared/dialog/RegisterDialog';
import { FeedbackDialog } from 'shared/dialog/FeedbackDialog';
import { useOnLogout } from 'util/user/useOnLogout';
import { useNewFeedbackCount } from 'util/feedback';
import { CreateArticleDialog } from 'shared/dialog/CreateArticleDialog';
import { CurrentUserAvatar } from 'shared/userAvatar/UserAvatar';
import { useTenant } from 'util/tenant';
import { useRouter } from 'next/router';
import Link from 'next/link';
import clsx from 'clsx';

import GetUnpublishedArticlesQuery from 'api/query/GetUnpublishedArticlesQuery.graphql';

import styles from './UserNavigation.module.scss';

export const UserNavigation = React.memo(() => {
  const { t } = useTranslation();
  const currentUser = useCurrentUser();
  const tenant = useTenant();

  const router = useRouter();
  const { data: unpublishedArticlesData } = useQuery<{
    articles: ArticleModel[];
  }>(GetUnpublishedArticlesQuery, {
    skip: !User.isAdmin(currentUser),
  });
  const newMessagesBadgeNumber = currentUser?.unreadMessages ?? 0;

  const newFeedbackBadgeNumber = useNewFeedbackCount();

  const onLogout = useOnLogout();

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
          break;
        case 'files':
          router.push('/profile/files');
          break;
        case 'own-articles':
          router.push('/profile/articles');
          break;
        case 'feedback':
          setFeedbackModalIsOpen(true);
          break;
        case 'administration':
          router.push('/admin');
          break;
        case 'unpublished':
          router.push('/unpublished');
          break;
        case 'logout':
          onLogout();
          break;
        default:
          throw new Error('Action is not supported!');
      }
    },
    [router, onLogout]
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
              label={t('new article')}
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
                {t('messages')}
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
                    {t('my account')}{' '}
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
                  {t('my data')}
                </Item>,
                <Item key={'files'} textValue={'Meine Dateien und Medien'}>
                  <Icon icon={faFolder} color="secondary" />
                  {t('my files and media')}
                </Item>,
                <Item key={'own-articles'} textValue={'Meine Beiträge'}>
                  <Icon icon={faClipboardList} color="secondary" />
                  {t('my articles')}
                </Item>,
                <Item key={'feedback'} textValue={'Feedback'}>
                  <Icon icon={faCommentDots} color="secondary" />
                  {t('feedback')}
                </Item>,
                ...(User.isAdmin(currentUser)
                  ? [
                      <Item
                        key={'administration'}
                        textValue={'Seite administration'}
                      >
                        <Icon icon={faShieldHalved} color="secondary" />
                        <span>
                          {t('administrate page')}
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
                          {t('publish articles')}
                          <Badge value={unpublishedBadgeNumber} />
                        </span>
                      </Item>,
                    ]
                  : []),
                <Item key={'logout'} textValue={'Abmelden'}>
                  <Icon icon={faArrowRightFromBracket} color="secondary" />
                  {t('logout')}
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
            label={t('login')}
            className={clsx('secondary', 'small')}
          ></NavigationButton>
          {tenant?.configuration.isEmailRegistrationEnabled !== false && (
            <NavigationButton
              secondary
              onClick={() => setRegisterModalIsOpen(true)}
              label={t('register')}
              className={clsx('secondary', 'small')}
            ></NavigationButton>
          )}
          <Link href={'/search'} passHref legacyBehavior>
            <NavigationButton
              secondary
              onClick={() => router.push('/search')}
              label={t('search')}
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
    t,
    currentUser,
    tenant,
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
