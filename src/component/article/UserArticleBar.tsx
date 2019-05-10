import React, { FunctionComponent, memo } from 'react';
import { UserModel, ArticleModel, UserGroup } from '../../model';
import { Card, Button, CardActions } from '@material-ui/core';
import { Link } from 'react-router-dom';

interface UserArticleBarProps {
    user: UserModel;
    article: ArticleModel;
}

export const UserArticleBar: FunctionComponent<UserArticleBarProps> = memo(({ user, article }) => (
    user && user.group > UserGroup.GUEST ? (
        <Card>
            <CardActions style={{ justifyContent: 'right' }}>
                <Button
                    variant="outlined"
                    color={'primary'}
                    component={({ children, href, ...props }) => <Link to={href!} {...props}>{children}</Link>}
                    href={`/article/${article.id}`}
                >
                    Artikel bearbeiten
            </Button>
            </CardActions>
        </Card>
    ) : null
));