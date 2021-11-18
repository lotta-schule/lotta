import * as React from 'react';
import {
    AccountCircle,
    Group,
    BarChart,
    CropFree,
    Palette,
    Tune,
    Category,
    Slideshow,
} from '@material-ui/icons';
import { BaseButton } from 'component/general/button/BaseButton';
import Link from 'next/link';

import styles from './Navigation.module.scss';

export const Navigation = React.memo(() => {
    return (
        <div className={styles.root}>
            <h3>Mein lotta</h3>
            <section className={styles.buttonRow}>
                <Link href={'/admin/system/general'} passHref>
                    <BaseButton
                        variant={'borderless'}
                        className={styles.button}
                    >
                        <span>
                            <Tune />
                        </span>
                        <span>Grundeinstellungen</span>
                    </BaseButton>
                </Link>

                <Link href={'/admin/system/presentation'} passHref>
                    <BaseButton
                        variant={'borderless'}
                        className={styles.button}
                    >
                        <span>
                            <Palette />
                        </span>
                        <span>Darstellung</span>
                    </BaseButton>
                </Link>

                <Link href={'/admin/system/usage'} passHref>
                    <BaseButton
                        variant={'borderless'}
                        className={styles.button}
                    >
                        <span>
                            <BarChart />
                        </span>
                        <span>Nutzung</span>
                    </BaseButton>
                </Link>
            </section>

            <h3>Nutzer und Gruppen</h3>
            <section className={styles.buttonRow}>
                <Link href={'/admin/users/list'} passHref>
                    <BaseButton
                        variant={'borderless'}
                        className={styles.button}
                    >
                        <span>
                            <AccountCircle />
                        </span>
                        <span>Nutzer</span>
                    </BaseButton>
                </Link>

                <Link href={'/admin/users/groups'} passHref>
                    <BaseButton
                        variant={'borderless'}
                        className={styles.button}
                    >
                        <span>
                            <Group />
                        </span>
                        <span>Gruppen</span>
                    </BaseButton>
                </Link>

                <Link href={'/admin/users/constraints'} passHref>
                    <BaseButton
                        variant={'borderless'}
                        className={styles.button}
                    >
                        <span>
                            <CropFree />
                        </span>
                        <span>Beschränkungen</span>
                    </BaseButton>
                </Link>
            </section>

            <h3>Kategorien und Marginalen</h3>
            <section className={styles.buttonRow}>
                <Link href={'/admin/categories/list'} passHref>
                    <BaseButton
                        variant={'borderless'}
                        className={styles.button}
                    >
                        <span>
                            <Category />
                        </span>
                        <span>Kategorien</span>
                    </BaseButton>
                </Link>

                <Link href={'/admin/categories/widgets'} passHref>
                    <BaseButton
                        variant={'borderless'}
                        className={styles.button}
                    >
                        <span>
                            <Slideshow />
                        </span>
                        <span>Marginalen</span>
                    </BaseButton>
                </Link>
            </section>
        </div>
    );
});
Navigation.displayName = 'AdminNavigation';
