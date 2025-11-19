import * as React from 'react';
import {
  faBook,
  faCircleUser,
  faUserGroup,
  faChartBar,
  faExpand,
  faPalette,
  faSliders,
  faShapes,
  faSquareCaretRight,
  faCommentDots,
  faChartLine,
  faCubes,
  faDoorOpen,
  faCalendar,
} from '@fortawesome/free-solid-svg-icons';
import { BaseButton } from '@lotta-schule/hubert';
import { serverTranslations } from 'i18n/server';
import { Icon } from 'shared/Icon';
import { NewFeedbackCountBadge } from 'component/feedback/NewFeedbackCountBadge';
import { AdminPage } from './_component/AdminPage';
import Link from 'next/link';

import styles from './page.module.scss';

async function AdminRootPage() {
  const { t } = await serverTranslations();
  return (
    <AdminPage
      icon={faCubes}
      title={t('Administration')}
      className={styles.root}
    >
      <h3>{t('My lotta')}</h3>
      <section>
        <BaseButton
          as={Link}
          href={'/admin/general'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faSliders} />
          </span>
          <span>{t('general')}</span>
        </BaseButton>

        <BaseButton
          as={Link}
          href={'/admin/presentation'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faPalette} />
          </span>
          <span>{t('presentation')}</span>
        </BaseButton>

        <BaseButton
          as={Link}
          href={'/admin/calendars'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faCalendar} />
          </span>
          <span>{t('calendar')}</span>
        </BaseButton>

        <BaseButton
          as={Link}
          href={'/admin/usage'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faChartBar} />
          </span>
          <span>{t('usage')}</span>
        </BaseButton>

        <BaseButton
          as={Link}
          href={'/admin/analytics'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faChartLine} />
          </span>
          <span>{t('statistics')}</span>
        </BaseButton>

        <BaseButton
          as={Link}
          href={'/admin/feedback'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faCommentDots} />
          </span>
          <span>
            {t('feedback')}
            <NewFeedbackCountBadge />
          </span>
        </BaseButton>
      </section>

      <h3>{t('users and groups')}</h3>
      <section>
        <BaseButton
          as={Link}
          href={'/admin/users'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faCircleUser} />
          </span>
          <span>{t('users')}</span>
        </BaseButton>

        <BaseButton
          as={Link}
          href={'/admin/groups'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faUserGroup} />
          </span>
          <span>{t('groups')}</span>
        </BaseButton>

        <BaseButton
          as={Link}
          href={'/admin/constraints'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faExpand} />
          </span>
          <span>{t('constraints')}</span>
        </BaseButton>
      </section>

      <h3>{t('categories and widgets')}</h3>
      <section>
        <BaseButton
          as={Link}
          href={'/admin/categories'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faShapes} />
          </span>
          <span>{t('categories')}</span>
        </BaseButton>

        <BaseButton
          as={Link}
          href={'/admin/widgets'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faSquareCaretRight} />
          </span>
          <span>{t('widgets')}</span>
        </BaseButton>
      </section>

      <h3>{t('Help')}</h3>
      <section>
        <BaseButton
          as={Link}
          href={'https://docs.lotta.schule'}
          target={'_blank'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faBook} />
          </span>
          <span>{t('Documentation')}</span>
        </BaseButton>
      </section>

      <section>
        <BaseButton
          as={Link}
          href={'/'}
          variant={'borderless'}
          className={styles.button}
        >
          <span>
            <Icon icon={faDoorOpen} />
          </span>
          <span>{t('leave area')}</span>
        </BaseButton>
      </section>
    </AdminPage>
  );
}

export default AdminRootPage;
