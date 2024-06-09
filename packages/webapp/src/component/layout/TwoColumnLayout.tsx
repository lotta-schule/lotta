import styles from './TwoColumnLayout.module.scss';

export const TwoColumnLayout = ({ children }: React.PropsWithChildren) => {
  return <div className={styles.root}>{children}</div>;
};

export const TwoColumnLayoutSidebar = ({
  children,
}: React.PropsWithChildren) => {
  return <aside className={styles.sidebar}>{children}</aside>;
};

export const TwoColumnLayoutContent = ({
  children,
}: React.PropsWithChildren) => {
  return <main className={styles.main}>{children}</main>;
};
