import clsx from 'clsx';

import styles from './AdminPageSection.module.scss';

export type AdminPageSectionProps = React.PropsWithChildren<{
  title?: string;
  bottomToolbar?: boolean;
}>;

export const AdminPageSection = ({
  title,
  bottomToolbar,
  children,
}: AdminPageSectionProps) => {
  return (
    <section
      className={clsx(styles.root, { [styles.bottomToolbar]: !!bottomToolbar })}
    >
      {title && <h4>{title}</h4>}
      {children}
    </section>
  );
};
