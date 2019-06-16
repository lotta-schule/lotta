import React, { FunctionComponent, memo } from 'react';
import { UserModel, ArticleModel } from '../../model';
import { Card, Button, CardActionArea } from '@material-ui/core';
import { CollisionLink } from '../general/CollisionLink';

interface UserArticleBarProps {
    user: UserModel;
    article: ArticleModel;
}

export const UserArticleBar: FunctionComponent<UserArticleBarProps> = memo(({ user, article }) => (
    user/* && user.group > UserGroup.GUEST*/ ? (
        <Card>
            <CardActionArea style={{ justifyContent: 'right' }}>
                <Button
                    variant="outlined"
                    color={'primary'}
                    component={CollisionLink}
                    to={`/article/${article.id}`}
                >
                    Artikel bearbeiten
                </Button>
            </CardActionArea>
        </Card>
    ) : null
));