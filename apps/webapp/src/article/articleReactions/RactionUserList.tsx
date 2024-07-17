import { useSuspenseQuery } from '@apollo/client';
import { MenuList, ListItem } from '@lotta-schule/hubert';
import { ArticleModel, ArticleReactionType, UserModel } from 'model';
import { UserAvatar } from 'shared/userAvatar/UserAvatar';

import GetReactionUsersQuery from 'api/query/GetReactionUsersQuery.graphql';
import { memo } from 'react';

export type ReactionUserListProps = {
  articleId: ArticleModel['id'];
  reaction: ArticleReactionType;
  header?: React.ReactNode | React.ReactNode[];
};

export const ReactionUserList = memo(
  ({ articleId, reaction, header }: ReactionUserListProps) => {
    const {
      data: { users },
    } = useSuspenseQuery<{ users: UserModel[] }>(GetReactionUsersQuery, {
      variables: { id: articleId, reaction },
    });
    return (
      <MenuList>
        {header || null}
        {users.map((user) => (
          <ListItem leftSection={<UserAvatar user={user} />} key={user.id}>
            {user.name}
          </ListItem>
        ))}
      </MenuList>
    );
  }
);
ReactionUserList.displayName = 'ReactionUserList';
