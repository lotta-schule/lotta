import * as React from 'react';
import { useSuspenseQuery } from '@apollo/client/react';
import { List, ListItem, Overlay } from '@lotta-schule/hubert';
import { ArticleModel, ArticleReactionType, UserModel } from 'model';
import { UserAvatar } from 'shared/userAvatar/UserAvatar';

import GetReactionUsersQuery from 'api/query/GetReactionUsersQuery.graphql';

export type ReactionUserListProps = {
  articleId: ArticleModel['id'];
  reaction: ArticleReactionType;
  header?: React.ReactNode | React.ReactNode[];
};

export const ReactionUserList = React.memo(
  ({ articleId, reaction, header }: ReactionUserListProps) => {
    const {
      data: { users },
    } = useSuspenseQuery<{ users: UserModel[] }>(GetReactionUsersQuery, {
      variables: { id: articleId, reaction },
    });
    return (
      <Overlay data-testid="ReactionUserList">
        {header || null}
        <List>
          {users.map((user) => (
            <ListItem leftSection={<UserAvatar user={user} />} key={user.id}>
              {user.name}
            </ListItem>
          ))}
        </List>
      </Overlay>
    );
  }
);
ReactionUserList.displayName = 'ReactionUserList';
