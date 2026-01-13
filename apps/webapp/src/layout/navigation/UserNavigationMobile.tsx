'use client';
import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { Badge, BaseButton, Button } from '@lotta-schule/hubert';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useTenant } from 'util/tenant/useTenant';
import { Icon } from 'shared/Icon';
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
  faCirclePlus,
  faCommentDots,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { ArticleModel } from 'model';
import { User, Article } from 'util/model';
import { isMobileDrawerOpenVar } from 'api/apollo/cache';
import { CreateArticleDialog } from 'shared/dialog/CreateArticleDialog';
import { LoginDialog } from 'shared/dialog/login';
import { RegisterDialog } from 'shared/dialog/RegisterDialog';
import { FeedbackDialog } from 'shared/dialog/FeedbackDialog';
import { useNewFeedbackCount } from 'util/feedback';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import GetUnpublishedArticlesQuery from 'api/query/GetUnpublishedArticlesQuery.graphql';

import styles from './UserNavigationMobile.module.scss';

export const UserNavigationMobile = React.memo(() => {
  const { t } = useTranslation();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const tenant = useTenant();
  const newMessagesBadgeNumber = currentUser?.unreadMessages ?? 0;
  const newFeedbackBadgeNumber = useNewFeedbackCount();

  const { data: unpublishedArticlesData } = useQuery<{
    articles: ArticleModel[];
  }>(GetUnpublishedArticlesQuery, {
    skip: !currentUser || !User.isAdmin(currentUser),
  });
  const unpublishedBadgeNumber = unpublishedArticlesData?.articles.filter(
    (article) => !article.readyToPublish || !article.published
  ).length;

  const [loginModalIsOpen, setLoginModalIsOpen] = React.useState(false);
  const [registerModalIsOpen, setRegisterModalIsOpen] = React.useState(false);
  const [feedbackModalIsOpen, setFeedbackModalIsOpen] = React.useState(false);
  const [createArticleModalIsOpen, setCreateArticleModalIsOpen] =
    React.useState(false);

  return (
    <>
      {!!currentUser && (
        <>
          <nav className={styles.root}>
            <Link href="/auth/logout" passHref legacyBehavior>
              <BaseButton
                variant={'borderless'}
                className={styles.button}
                data-testid="LogoutButton"
              >
                <Icon icon={faArrowRightFromBracket} size="xl" />
                <span className={styles.label}>Abmelden</span>
              </BaseButton>
            </Link>
            <BaseButton
              variant={'borderless'}
              className={styles.button}
              onClick={() => {
                setCreateArticleModalIsOpen(true);
              }}
              data-testid="CreateArticleButton"
            >
              <Icon icon={faCirclePlus} size="lg" />
              <span className={styles.label}>{t('article')}</span>
            </BaseButton>
            <Link href={'/search'} passHref legacyBehavior>
              <BaseButton
                variant={'borderless'}
                className={styles.button}
                data-testid="SearchButton"
              >
                <Icon icon={faMagnifyingGlass} size="xl" />
                <span className={styles.label}>{t('search')}</span>
              </BaseButton>
            </Link>
            <Link href={'/profile'} passHref legacyBehavior>
              <BaseButton
                variant={'borderless'}
                className={styles.button}
                data-testid="ProfileButton"
              >
                <Icon icon={faUser} size="xl" />
                <span className={styles.label}>{t('profile')}</span>
              </BaseButton>
            </Link>
            <Link href={'/profile/files'} passHref legacyBehavior>
              <BaseButton
                variant={'borderless'}
                className={styles.button}
                data-testid="ProfileFilesButton"
              >
                <Icon icon={faFolder} size="xl" />
                <span className={styles.label}>{t('files')}</span>
              </BaseButton>
            </Link>
            <Link href={'/profile/articles'} passHref legacyBehavior>
              <BaseButton
                variant={'borderless'}
                className={styles.button}
                data-testid="OwnArticlesButton"
              >
                <Icon icon={faClipboardList} size="xl" />
                <span className={styles.label}>{t('my articles')}</span>
              </BaseButton>
            </Link>
            <BaseButton
              variant={'borderless'}
              className={styles.button}
              data-testid="FeedbackButton"
              onClick={() => setFeedbackModalIsOpen(true)}
            >
              <Icon icon={faCommentDots} size="xl" />
              <span className={styles.label}>{t('feedback')}</span>
            </BaseButton>
            <Link href={'/messaging'} passHref legacyBehavior>
              <BaseButton
                variant={'borderless'}
                className={styles.button}
                data-testid="MessagingButton"
              >
                <Icon icon={faComments} size={'lg'} />
                <span className={styles.label}>
                  {t('messages')}{' '}
                  <Badge
                    value={newMessagesBadgeNumber}
                    className={styles.badge}
                  />
                </span>
              </BaseButton>
            </Link>
            {User.isAdmin(currentUser) && (
              <>
                <Link href={'/admin'} passHref legacyBehavior>
                  <BaseButton
                    variant={'borderless'}
                    className={styles.button}
                    data-testid="AdminButton"
                  >
                    <Icon icon={faShieldHalved} size="xl" />
                    <span className={styles.label}>
                      {t('admin')}
                      <Badge
                        value={newFeedbackBadgeNumber}
                        data-testid="FeedbackBadge"
                      />
                    </span>
                  </BaseButton>
                </Link>
                <Link href={'/unpublished'} passHref legacyBehavior>
                  <BaseButton variant={'borderless'} className={styles.button}>
                    <Icon icon={faClipboardList} size="xl" />
                    <span className={styles.label}>
                      {t('release articles')}
                      <Badge
                        value={unpublishedBadgeNumber}
                        className={styles.badge}
                        data-testid="UnpublishedArticlesButton"
                      />
                    </span>
                  </BaseButton>
                </Link>
              </>
            )}
            {!User.isAdmin(currentUser) && (
              <>
                <div />
                <div />
              </>
            )}
            <div />
          </nav>
          <CreateArticleDialog
            isOpen={createArticleModalIsOpen}
            onAbort={() => setCreateArticleModalIsOpen(false)}
            onConfirm={(article) => {
              router.push(Article.getPath(article, { edit: true }));
            }}
          />
          <FeedbackDialog
            isOpen={feedbackModalIsOpen}
            onRequestClose={() => {
              setFeedbackModalIsOpen(false);
            }}
          />
        </>
      )}
      {!currentUser && (
        <>
          <div>
            <Button
              fullWidth
              variant={'borderless'}
              onClick={() => setLoginModalIsOpen(true)}
              data-testid="LoginButton"
            >
              {t('login')}
            </Button>
            {tenant?.configuration.isEmailRegistrationEnabled !== false && (
              <Button
                variant={'borderless'}
                fullWidth
                onClick={() => setRegisterModalIsOpen(true)}
                data-testid="RegisterButton"
              >
                {t('register')}
              </Button>
            )}
            <Link href={'/search'} passHref legacyBehavior>
              <Button
                fullWidth
                data-testid="SearchButton"
                variant={'borderless'}
              >
                {t('search')}
              </Button>
            </Link>
          </div>
        </>
      )}
      {/*
        There are situations where we do not want the modal to just vanish
        when the user changes state to login, such as changing the password
        first time. So we need to handle these outside of any currentUser
        conditional
      */}
      <LoginDialog
        isOpen={loginModalIsOpen}
        onRequestClose={() => {
          setLoginModalIsOpen(false);
          isMobileDrawerOpenVar(false);
        }}
      />
      <RegisterDialog
        isOpen={registerModalIsOpen}
        onRequestClose={() => {
          setRegisterModalIsOpen(false);
          isMobileDrawerOpenVar(false);
        }}
      />
    </>
  );
});
UserNavigationMobile.displayName = 'UserNavigationMobile';
