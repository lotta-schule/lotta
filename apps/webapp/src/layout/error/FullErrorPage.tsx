import * as React from 'react';

import styles from './error.module.scss';

export type FullErrorPageProps = React.PropsWithChildren<{
  title: string;
  subtitle?: string;
  imageUrl?: string;
}>;

export const FullErrorPage = ({
  title,
  subtitle,
  imageUrl,
  children,
}: FullErrorPageProps) => {
  return (
    <section className={styles.error}>
      <h1>
        {title}
        {subtitle && ': '}
        {subtitle && <strong>{subtitle}</strong>}
      </h1>
      <div>
        {imageUrl && (
          <img
            role="presentation"
            src={imageUrl}
            alt={'Diese Seite existiert nicht'}
          />
        )}
        {children}
      </div>
    </section>
  );
};
FullErrorPage.displayName = 'FullErrorPage';

export const SecondaryErrorText = ({ children }: React.PropsWithChildren) => {
  return <p className={styles.secondary}>{children}</p>;
};
