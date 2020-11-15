import * as React from 'react';
import { makeStyles, Link, Typography } from '@material-ui/core';
import { useCategories } from 'util/categories/useCategories';
import { Category } from 'util/model';
import { CollisionLink } from 'component/general/CollisionLink';
import { CategoryModel } from 'model';

const useStyles = makeStyles(theme => ({
    root: {
        [theme.breakpoints.down('md')]: {
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            textAlign: 'center'
        },
        [theme.breakpoints.up('md')]: {
            display: 'none'
        },
        [theme.breakpoints.up('lg')]: {
            display: 'block',
            top: '30vh',
            right: '-1em',
            position: 'absolute',
            fontSize: '.9rem',
            transform: 'rotate(270deg)',
            transformOrigin: 'right',
        }
    },
    font: {
        fontSize: '0.8rem',
    }
}));

export const Footer = React.memo(() => {
    const styles = useStyles();
    const categories = useCategories()[0].filter(category => category.isSidenav);
    const destProps = React.useCallback((category: CategoryModel): { to?: string; href?: string; } => {
        if (category.redirect && /^https?:\/\//.test(category.redirect)) {
            return { href: category.redirect, to: void 0 };
        } else {
            return { to: category.redirect ? category.redirect : Category.getPath(category), href: void 0 };
        }
    }, []);
    return (
        <div className={styles.root}>
            <Typography className={styles.font}>
                {categories.map(category => {
                    const destPropsObj = destProps(category);
                    return (
                        <React.Fragment key={category.id}>
                            <Link data-testid="SidenavLink" component={destPropsObj.href ? 'a' : CollisionLink} {...destPropsObj}>
                                {category.title}
                            </Link>
                            &nbsp;|&nbsp;
                        </React.Fragment>
                    );
                })}
                <Link data-testid="SidenavLink" component={CollisionLink} to={`/privacy`}>Datenschutz</Link>
            </Typography>
        </div>
    )
});
