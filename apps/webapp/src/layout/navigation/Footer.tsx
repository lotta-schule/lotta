import * as React from 'react';
import { Category } from 'util/model';
import { useCategories } from 'util/categories/useCategories';
import { isExternalUrl } from 'util/isExternalUrl';
import Link from 'next/link';

import styles from './Footer.module.scss';

export const Footer = React.memo(() => {
  const categories = useCategories()[0].filter(
    (category) => category.isSidenav
  );
  return (
    <div className={styles.root}>
      {categories.map((category) => {
        const href = category.redirect || Category.getPath(category);
        const isExternal =
          category.redirect && isExternalUrl(category.redirect);

        return isExternal ? (
          <a
            key={category.id}
            href={href}
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="SidenavLink"
          >
            {category.title}
          </a>
        ) : (
          <Link
            key={category.id}
            href={href}
            className={styles.link}
            passHref
            data-testid="SidenavLink"
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
