import React, { memo } from 'react';
import { makeStyles, Link, Typography } from '@material-ui/core';
import { useCategories } from 'util/categories/useCategories';
import { Category } from 'util/model';
import { CollisionLink } from 'component/general/CollisionLink';

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

export const Footer = memo(() => {
    const styles = useStyles();
    const categories = useCategories()[0].filter(category => category.isSidenav);
    return (
        <div className={styles.root}>
            <Typography className={styles.font}>
                {categories.map(category => (
                    <React.Fragment key={category.id}>
                        <Link data-testid="SidenavLink" component={CollisionLink} to={category.redirect ? category.redirect : Category.getPath(category)}>
                            {category.title}
                        </Link>
                        &nbsp;|&nbsp;
                    </React.Fragment>
                ))}
                <Link data-testid="SidenavLink" component={CollisionLink} to={`/privacy`}>Datenschutz</Link>
            </Typography>
        </div>
    )
});
