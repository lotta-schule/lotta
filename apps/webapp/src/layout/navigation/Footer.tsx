import * as React from 'react';
import { Category, RedirectType } from 'util/model';
import { useCategories } from 'util/categories/useCategories';
import Link from 'next/link';

import styles from './Footer.module.scss';

export const Footer = React.memo(() => {
  const categories = useCategories()[0].filter(
    (category) => category.isSidenav
  );
  return (
    <div className={styles.root}>
      {categories.map((category) => {
        const isExternalLink =
          Category.getRedirectType(category) === RedirectType.Extern;
        return (
          <Link
            key={category.id}
            href={category.redirect || Category.getPath(category)}
            className={styles.link}
            passHref
            data-testid="SidenavLink"
            {...(isExternalLink && {
              target: '_blank',
              rel: 'noopener noreferrer',
            })}
          >
            {category.title}
          </Link>
        );
      })}
      <Link
        href={`/privacy`}
        passHref
        data-testid="SidenavLink"
        className={styles.privacy}
      >
        Datenschutz
      </Link>
    </div>
  );
});
Footer.displayName = 'Footer';
